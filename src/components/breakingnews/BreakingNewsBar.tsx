import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface NewsItem {
  title: string;
  url: string;
}

const BreakingNewsBar = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/news");
        const data = await res.json();
        // only grab top 5 titles
        const articles = Array.isArray(data) ? data : data.articles || [];
        setNews(
          articles.slice(0, 5).map((n: any) => ({
            title: n.title,
            url: n.url,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || news.length === 0) return null;

  return (
    <div className="w-full bg-white border-y border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <span className="font-semibold text-red-600 uppercase text-sm tracking-wide">
          Breaking News
        </span>
        <div className="overflow-hidden relative flex-1">
          <div className="animate-marquee whitespace-nowrap">
            {news.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-8 inline-block text-sm text-red-500 hover:underline"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreakingNewsBar;
