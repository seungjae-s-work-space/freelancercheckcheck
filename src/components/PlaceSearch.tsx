import { useState, useEffect, useRef } from 'react';

interface KakaoPlace {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // lng
  y: string; // lat
}

interface Props {
  onSelect: (place: { name: string; lat: number; lng: number }) => void;
  onCancel: () => void;
  initialQuery?: string;
}

const KAKAO_REST_API_KEY = 'b629c46664ec0ecfaa01b0c00918f3c4';

export default function PlaceSearch({ onSelect, onCancel, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchPlaces = async (pageNum: number = 1, append: boolean = false) => {
    if (!query.trim()) return;

    setLoading(true);
    if (!append) setSearched(true);

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&page=${pageNum}&size=15`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await response.json();

      if (append) {
        setResults((prev) => [...prev, ...data.documents]);
      } else {
        setResults(data.documents || []);
      }
      setHasMore(!data.meta.is_end);
      setPage(pageNum);
    } catch (error) {
      console.error('Search failed:', error);
      if (!append) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPlaces(1, false);
    }
  };

  const handleLoadMore = () => {
    searchPlaces(page + 1, true);
  };

  const handleSelect = (place: KakaoPlace) => {
    onSelect({
      name: place.place_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">장소 검색</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="장소명 또는 주소 입력"
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => searchPlaces(1, false)}
              disabled={loading || !query.trim()}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {loading ? '...' : '검색'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading && results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">검색 중...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(place)}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{place.place_name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {place.road_address_name || place.address_name}
                  </div>
                </button>
              ))}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-3 text-blue-500 font-medium hover:bg-blue-50 rounded-xl"
                >
                  {loading ? '로딩 중...' : '더 보기'}
                </button>
              )}
            </div>
          ) : searched ? (
            <div className="text-center py-8 text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              장소명이나 주소를 검색하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
