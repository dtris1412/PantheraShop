import { useState, useEffect } from "react";
import { Tag, Trophy, Award, Shield, ArrowRight, Settings } from "lucide-react";
import CategoryManagement from "../components/CategoryComponents/CategoryManagement";
import SportsManagement from "../components/CategoryComponents/SportsManagement";
import TournamentManagement from "../components/CategoryComponents/TournamentManagement";
import TeamManagement from "../components/CategoryComponents/TeamManagement";
import { useCategory, CategoryStats } from "../contexts/categoryContext";

type TabType = "overview" | "categories" | "sports" | "tournaments" | "teams";

const CategoryPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<CategoryStats>({
    categoriesCount: 0,
    sportsCount: 0,
    tournamentsCount: 0,
    teamsCount: 0,
  });
  const { getStats, loading } = useCategory();

  // Load statistics when component mounts
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };

    if (activeTab === "overview") {
      loadStats();
    }
    // Chỉ phụ thuộc vào activeTab, không phụ thuộc getStats để tránh infinite loop
  }, [activeTab]); // Xóa getStats khỏi dependency

  const tabs = [
    {
      id: "overview" as TabType,
      name: "Tổng quan",
      icon: Settings,
      color: "text-gray-600",
    },
    {
      id: "categories" as TabType,
      name: "Danh mục sản phẩm",
      icon: Tag,
      color: "text-blue-600",
    },
    {
      id: "sports" as TabType,
      name: "Môn thể thao",
      icon: Trophy,
      color: "text-orange-600",
    },
    {
      id: "tournaments" as TabType,
      name: "Giải đấu",
      icon: Award,
      color: "text-purple-600",
    },
    {
      id: "teams" as TabType,
      name: "Đội/CLB",
      icon: Shield,
      color: "text-green-600",
    },
  ];

  const overviewCards = [
    {
      title: "Danh mục sản phẩm",
      description: "Quản lý các danh mục phân loại sản phẩm",
      icon: Tag,
      color: "bg-blue-100 text-blue-600",
      count: `${stats.categoriesCount} danh mục`,
      action: () => setActiveTab("categories"),
    },
    {
      title: "Môn thể thao",
      description: "Quản lý các môn thể thao và cấu hình",
      icon: Trophy,
      color: "bg-orange-100 text-orange-600",
      count: `${stats.sportsCount} môn thể thao`,
      action: () => setActiveTab("sports"),
    },
    {
      title: "Giải đấu",
      description: "Quản lý các giải đấu theo môn thể thao",
      icon: Award,
      color: "bg-purple-100 text-purple-600",
      count: `${stats.tournamentsCount} giải đấu`,
      action: () => setActiveTab("tournaments"),
    },
    {
      title: "Đội/CLB",
      description: "Quản lý các đội và câu lạc bộ",
      icon: Shield,
      color: "bg-green-100 text-green-600",
      count: `${stats.teamsCount} đội/CLB`,
      action: () => setActiveTab("teams"),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "categories":
        return <CategoryManagement />;
      case "sports":
        return <SportsManagement />;
      case "tournaments":
        return <TournamentManagement />;
      case "teams":
        return <TeamManagement />;
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="text-gray-600" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Quản lý danh mục
                  </h1>
                  <p className="text-gray-600">
                    Tổng quan và quản lý tất cả danh mục trong hệ thống
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? "..." : stats.categoriesCount}
                  </div>
                  <div className="text-sm text-blue-600">Danh mục sản phẩm</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {loading ? "..." : stats.sportsCount}
                  </div>
                  <div className="text-sm text-orange-600">Môn thể thao</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : stats.tournamentsCount}
                  </div>
                  <div className="text-sm text-purple-600">Giải đấu</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? "..." : stats.teamsCount}
                  </div>
                  <div className="text-sm text-green-600">Đội/CLB</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {overviewCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.title}
                    className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={card.action}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}
                        >
                          <IconComponent size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {card.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            {card.count}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hierarchy Information */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cấu trúc phân cấp
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Trophy className="text-orange-600" size={20} />
                  <span className="font-medium">Môn thể thao</span>
                  <ArrowRight className="text-gray-400" size={16} />
                  <Award className="text-purple-600" size={20} />
                  <span className="font-medium">Giải đấu</span>
                  <ArrowRight className="text-gray-400" size={16} />
                  <Shield className="text-green-600" size={20} />
                  <span className="font-medium">Đội/CLB</span>
                  <ArrowRight className="text-gray-400" size={16} />
                  <span className="text-gray-600">Sản phẩm</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Tag className="text-blue-600" size={20} />
                  <span className="font-medium">Danh mục sản phẩm</span>
                  <ArrowRight className="text-gray-400" size={16} />
                  <span className="text-gray-600">Sản phẩm</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Sản phẩm có thể thuộc về cả Danh mục
                  và Đội/CLB. Khi xóa môn thể thao, tất cả giải đấu và đội liên
                  quan sẽ bị xóa.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <IconComponent size={18} className={tab.color} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">{renderTabContent()}</div>
    </div>
  );
};

export default CategoryPage;
