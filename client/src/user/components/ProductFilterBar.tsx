import { useState } from "react";
import { useProduct } from "../../shared/contexts/productContext";

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        className="flex justify-between items-center w-full py-3 font-semibold border-b"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span>{title}</span>
        <span className="ml-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="py-2">{children}</div>}
    </div>
  );
}

export default function ProductFilterBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSport,
  setSelectedSport,
  selectedTournament,
  setSelectedTournament,
  selectedTeam,
  setSelectedTeam,
}: {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  selectedTournament: string;
  setSelectedTournament: (tournament: string) => void;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
}) {
  const { sports, products } = useProduct();

  const tournaments = Array.from(
    new Set(
      products
        .filter(
          (p) =>
            !selectedSport ||
            p.Team?.Tournament?.Sport?.sport_name === selectedSport
        )
        .map((p) => p.Team?.Tournament?.tournament_name)
        .filter((name): name is string => !!name)
    )
  );

  const teams = Array.from(
    new Set(
      products
        .filter(
          (p) =>
            (!selectedSport ||
              p.Team?.Tournament?.Sport?.sport_name === selectedSport) &&
            (!selectedTournament ||
              p.Team?.Tournament?.tournament_name === selectedTournament)
        )
        .map((p) => p.Team?.team_name)
        .filter((name): name is string => !!name)
    )
  );

  return (
    <aside className="w-full md:w-64 pr-4 space-y-4 border-r">
      <button
        className="mb-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium w-full"
        onClick={() => {
          setSelectedCategory("Tất cả");
          setSelectedSport("");
          setSelectedTournament("");
          setSelectedTeam("");
        }}
      >
        Đặt lại bộ lọc
      </button>
      <Accordion
        title={
          selectedCategory === "Tất cả"
            ? "Phân loại"
            : `Phân loại: ${selectedCategory}`
        }
        defaultOpen
      >
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded ${
                selectedCategory === cat
                  ? "bg-black text-white font-semibold"
                  : ""
              }`}
            >
              <input
                type="radio"
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(cat)}
                className="accent-black"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion
        title={
          selectedSport === ""
            ? "Môn thể thao"
            : `Môn thể thao: ${selectedSport}`
        }
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded">
            <input
              type="radio"
              checked={selectedSport === ""}
              onChange={() => setSelectedSport("")}
              className="accent-black"
            />
            <span>Tất cả</span>
          </label>
          {sports.map((sport) => (
            <label
              key={sport.sport_id}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded ${
                selectedSport === sport.sport_name
                  ? "bg-black text-white font-semibold"
                  : ""
              }`}
            >
              <input
                type="radio"
                checked={selectedSport === sport.sport_name}
                onChange={() => setSelectedSport(sport.sport_name)}
                className="accent-black"
              />
              <span>{sport.sport_name}</span>
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion
        title={
          selectedTournament === ""
            ? "Giải đấu"
            : `Giải đấu: ${selectedTournament}`
        }
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded">
            <input
              type="radio"
              checked={selectedTournament === ""}
              onChange={() => setSelectedTournament("")}
              className="accent-black"
            />
            <span>Tất cả</span>
          </label>
          {tournaments.map((tournament) => (
            <label
              key={tournament}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded ${
                selectedTournament === tournament
                  ? "bg-black text-white font-semibold"
                  : ""
              }`}
            >
              <input
                type="radio"
                checked={selectedTournament === tournament}
                onChange={() => setSelectedTournament(tournament)}
                className="accent-black"
              />
              <span>{tournament}</span>
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion
        title={selectedTeam === "" ? "Đội bóng" : `Đội bóng: ${selectedTeam}`}
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded">
            <input
              type="radio"
              checked={selectedTeam === ""}
              onChange={() => setSelectedTeam("")}
              className="accent-black"
            />
            <span>Tất cả</span>
          </label>
          {teams.map((team) => (
            <label
              key={team}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded ${
                selectedTeam === team ? "bg-black text-white font-semibold" : ""
              }`}
            >
              <input
                type="radio"
                checked={selectedTeam === team}
                onChange={() => setSelectedTeam(team)}
                className="accent-black"
              />
              <span>{team}</span>
            </label>
          ))}
        </div>
      </Accordion>
    </aside>
  );
}
