"use client";

import { useState } from "react";
import { Footer } from "@/components/footer";

interface TagResult {
  title: string;
  tags: string[];
  videoId: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TagResult | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const extractTags = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSelectedTags(new Set());

    try {
      const response = await fetch("/api/extract-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract tags");
      }

      setResult(data);
      // Select all tags by default
      setSelectedTags(new Set(data.tags));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  const selectAll = () => {
    if (result) {
      setSelectedTags(new Set(result.tags));
    }
  };

  const deselectAll = () => {
    setSelectedTags(new Set());
  };

  const copySelected = async () => {
    if (selectedTags.size === 0) {
      setError("No tags selected");
      return;
    }

    const tagsToCopy = Array.from(selectedTags).join(", ");

    try {
      await navigator.clipboard.writeText(tagsToCopy);
      // Show success feedback
      const button = document.getElementById("copy-btn");
      if (button) {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      extractTags();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl font-light text-white mb-8">
            YouTube Tag Extractor Tool
          </h1>

          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              placeholder="YouTube Video URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              disabled={loading}
            />
            <button
              onClick={extractTags}
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium rounded transition-colors"
            >
              {loading ? "Extracting..." : "Extract Tags"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded text-red-300">
              {error}
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              {/* Video Title */}
              <div>
                <p className="text-gray-300 text-lg mb-1">
                  Extracted tags for video:
                </p>
                <h2 className="text-red-400 text-xl font-semibold">
                  {result.title}
                </h2>
              </div>

              {/* Tags Container */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                {result.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded transition-all ${
                          selectedTags.has(tag)
                            ? "bg-red-600 text-white hover:bg-red-500"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">
                    No tags found for this video.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={selectAll}
                    disabled={result.tags.length === 0}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 text-gray-900 font-medium rounded transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    disabled={selectedTags.size === 0}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 text-gray-900 font-medium rounded transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
                <button
                  id="copy-btn"
                  onClick={copySelected}
                  disabled={selectedTags.size === 0}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium rounded transition-colors"
                >
                  Copy Selected
                </button>
              </div>

              {/* Selection Counter */}
              {result.tags.length > 0 && (
                <p className="text-gray-400 text-sm">
                  {selectedTags.size} of {result.tags.length} tags selected
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
