import { useState } from "react";
import { Autocomplete } from "./components/Autocomplete";
import { fetchItems, type Item } from "./api/mockApi";

function App() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f9f5ff, #fff)",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: "30px 20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          transition: "0.3s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)")
        }
      >
        <h1 style={{ marginBottom: 10, color: "#7b4eff", textAlign: "center" }}>
          Search for Items
        </h1>
        <p style={{ marginBottom: 20, textAlign: "center", color: "#555" }}>
          Start typing to see suggestions. Use arrow keys to navigate and enter
          to select.
        </p>

        <div style={{ width: "100%" }}>
          <Autocomplete<Item>
            fetcher={fetchItems}
            getLabel={(item) => item.label}
            onSelect={(item) => setSelectedItem(item)}
          />
          {selectedItem && (
            <div
              style={{
                marginTop: 20,
                padding: "10px 15px",
                background: "#f3f0ff",
                border: "1px solid #d0bfff",
                borderRadius: 8,
                color: "#4b00b5",
                fontWeight: 500,
              }}
            >
              Selected Item: {selectedItem?.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
