import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  description: string;
  publishedAt: string;
  source: { name: string };
  url: string;
}

const News = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/news");
    const data = await res.json();
    setNewsList(Array.isArray(data) ? data : data.articles || []); // 👈 safeguard
  } catch (err) {
    console.error(err);
    setNewsList([]);
  } finally {
    setLoading(false);
  }
};

    fetchNews();
  }, []);

  if (loading) {
    return <p className="text-center py-20">Loading news...</p>;
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsList.map((news, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">{news.title}</h3>
            <p className="text-slate-600 text-sm mb-3">{news.description}</p>
            <p className="text-xs text-slate-500">
              {new Date(news.publishedAt).toLocaleDateString()} — {news.source.name}
            </p>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Read more →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;