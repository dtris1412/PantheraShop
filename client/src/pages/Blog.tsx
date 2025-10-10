import { Calendar, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Blog() {
  const navigate = useNavigate();

  const posts = [
    {
      id: "1",
      title: "5 Essential Training Tips for Marathon Runners",
      excerpt:
        "Discover the key strategies professional athletes use to prepare for long-distance running. From nutrition to recovery techniques.",
      image:
        "https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=1200",
      author: "Sarah Johnson",
      date: "2025-10-01",
      category: "Running",
    },
    {
      id: "2",
      title: "Basketball Fundamentals: Improving Your Shooting Technique",
      excerpt:
        "Master the art of the perfect shot with our comprehensive guide covering form, follow-through, and mental preparation.",
      image:
        "https://images.pexels.com/photos/1080882/pexels-photo-1080882.jpeg?auto=compress&cs=tinysrgb&w=1200",
      author: "Marcus Williams",
      date: "2025-09-28",
      category: "Basketball",
    },
    {
      id: "3",
      title: "The Ultimate Guide to Sports Nutrition",
      excerpt:
        "Fuel your performance with science-backed nutrition strategies. Learn what to eat before, during, and after training.",
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200",
      author: "Dr. Emily Chen",
      date: "2025-09-25",
      category: "Nutrition",
    },
    {
      id: "4",
      title: "Building Core Strength for Athletic Performance",
      excerpt:
        "A strong core is the foundation of every sport. Explore exercises and routines that enhance stability and power.",
      image:
        "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=1200",
      author: "James Rodriguez",
      date: "2025-09-20",
      category: "Training",
    },
    {
      id: "5",
      title: "Recovery Techniques Every Athlete Should Know",
      excerpt:
        "Optimize your recovery with proven methods including ice baths, stretching routines, and sleep optimization.",
      image:
        "https://images.pexels.com/photos/3768593/pexels-photo-3768593.jpeg?auto=compress&cs=tinysrgb&w=1200",
      author: "Lisa Thompson",
      date: "2025-09-15",
      category: "Recovery",
    },
    {
      id: "6",
      title: "Choosing the Right Running Shoes for Your Foot Type",
      excerpt:
        "Not all running shoes are created equal. Find out which shoe design works best for your unique biomechanics.",
      image:
        "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=1200",
      author: "David Park",
      date: "2025-09-10",
      category: "Gear",
    },
  ];

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Training & Performance Blog
          </h1>
          <p className="text-gray-600 text-lg">
            Expert insights to elevate your game
          </p>
        </div>

        {/* FEATURED POST */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 mb-4">
                FEATURED
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{featuredPost.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(featuredPost.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/blog/${featuredPost.id}`)}
                className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
              >
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="order-1 lg:order-2">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>

        {/* REGULAR POSTS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <article
              key={post.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              <div className="bg-gray-100 mb-4 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {post.category}
                </span>

                <h3 className="text-xl font-bold group-hover:underline leading-snug">
                  {post.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>

                <div className="flex items-center space-x-4 text-xs text-gray-600 pt-2">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
