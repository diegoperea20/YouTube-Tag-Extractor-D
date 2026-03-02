import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Extract video ID
    let videoId = '';
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    } else {
      videoId = urlObj.searchParams.get('v') || '';
    }

    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    // Fetch YouTube page
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video page' },
        { status: 500 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract video title
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('h1.title').text() || 
                  $('h1.ytd-video-primary-info-renderer').text() ||
                  'Unknown Title';

    // Try to extract tags from various sources
    let tags: string[] = [];

    // Method 1: Look for tags in meta keywords
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // Method 2: Look for tags in script tags (JSON data)
    if (tags.length === 0) {
      const scripts = $('script');
      scripts.each((_, element) => {
        const scriptContent = $(element).text();
        
        // Look for tags in ytInitialData
        if (scriptContent.includes('ytInitialData')) {
          const tagMatches = scriptContent.match(/"keywords":"([^"]*)"/);
          if (tagMatches && tagMatches[1]) {
            const extractedTags = tagMatches[1].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            if (extractedTags.length > 0) {
              tags = extractedTags;
            }
          }
        }

        // Look for videoDetails
        if (scriptContent.includes('videoDetails')) {
          try {
            const videoDetailsMatch = scriptContent.match(/"videoDetails":\{([^}]*\})*/);
            if (videoDetailsMatch) {
              const keywordsMatch = scriptContent.match(/"keywords":"([^"]*)"/);
              if (keywordsMatch && keywordsMatch[1]) {
                const extractedTags = keywordsMatch[1].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                if (extractedTags.length > 0) {
                  tags = extractedTags;
                }
              }
            }
          } catch {
            // Ignore parsing errors
          }
        }
      });
    }

    // Method 3: Look for tags in the new YouTube interface (structured data)
    if (tags.length === 0) {
      const jsonLd = $('script[type="application/ld+json"]');
      jsonLd.each((_, element) => {
        try {
          const content = $(element).text();
          const data = JSON.parse(content);
          if (data.keywords && Array.isArray(data.keywords)) {
            tags = data.keywords;
          }
        } catch {
          // Ignore JSON parsing errors
        }
      });
    }

    // Remove duplicates and clean up tags
    tags = [...new Set(tags)].filter(tag => tag.length > 0 && tag !== 'video');

    return NextResponse.json({
      title: title.trim(),
      tags: tags,
      videoId: videoId,
    });

  } catch (error) {
    console.error('Error extracting tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
