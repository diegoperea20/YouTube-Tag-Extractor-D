
import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1).split('?')[0];
    }
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Could not extract video ID' }, { status: 400 });
    }

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // ✅ request to YouTube Data API v3
    const apiUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    apiUrl.searchParams.set('part', 'snippet');
    apiUrl.searchParams.set('id', videoId);
    apiUrl.searchParams.set('key', YOUTUBE_API_KEY);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch video data from YouTube API' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Video not found or is private' },
        { status: 404 }
      );
    }

    const snippet = data.items[0].snippet;
    const title = snippet.title || 'Unknown Title';
    const tags: string[] = snippet.tags || []; // ⚠️ Ver nota abajo

    return NextResponse.json({
      title: title.trim(),
      tags,
      videoId,
    });

  } catch (error) {
    console.error('Error fetching video data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


