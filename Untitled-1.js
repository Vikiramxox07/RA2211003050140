import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

const API_URL = "https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json";

export default function DoctorListingPage() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setDoctors(data));
  }, []);

  useEffect(() => {
    let result = [...doctors];
    const mode = searchParams.get("mode");
    const specialties = searchParams.getAll("specialty");
    const sort = searchParams.get("sort");
    const search = searchParams.get("search")?.toLowerCase() || "";

    if (search) {
      result = result.filter((doc) => doc.name.toLowerCase().includes(search));
    }
    if (mode) {
      result = result.filter((doc) => doc.mode === mode);
    }
    if (specialties.length) {
      result = result.filter((doc) =>
        specialties.every((s) => doc.specialties.includes(s))
      );
    }
    if (sort === "fees") {
      result.sort((a, b) => a.fees - b.fees);
    } else if (sort === "experience") {
      result.sort((a, b) => b.experience - a.experience);
    }
    setFilteredDoctors(result);
  }, [doctors, searchParams]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (val.length > 0) {
      const lowerVal = val.toLowerCase();
      const matches = doctors.filter((d) => d.name.toLowerCase().includes(lowerVal)).slice(0, 3);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const applySearch = (name) => {
    setSearchText(name);
    setSuggestions([]);
    setSearchParams((params) => {
      params.set("search", name);
      return params;
    });
  };

  return (
    <div className="p-4">
      <Input
        data-testid="autocomplete-input"
        value={searchText}
        onChange={handleSearchChange}
        onKeyDown={(e) => e.key === "Enter" && applySearch(searchText)}
        placeholder="Search doctors..."
      />
      <div>
        {suggestions.map((s) => (
          <div
            key={s.id}
            data-testid="suggestion-item"
            onClick={() => applySearch(s.name)}
            className="cursor-pointer p-2 border-b"
          >
            {s.name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredDoctors.map((doc) => (
          <Card key={doc.id} data-testid="doctor-card">
            <CardContent>
              <div data-testid="doctor-name">{doc.name}</div>
              <div data-testid="doctor-specialty">{doc.specialties.join(", ")}</div>
              <div data-testid="doctor-experience">Experience: {doc.experience} yrs</div>
              <div data-testid="doctor-fee">Fees: ₹{doc.fees}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
