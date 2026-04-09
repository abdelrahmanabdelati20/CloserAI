"use client";

import { useEffect, useState } from "react";

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  status: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importTab, setImportTab] = useState<"url" | "csv">("url");
  const [importUrl, setImportUrl] = useState("");
  const [importCsv, setImportCsv] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", price: "", address: "", city: "",
    bedrooms: "3", bathrooms: "2", sqft: "1500",
    propertyType: "house", description: "",
  });

  const load = () => {
    fetch("/api/dashboard/properties")
      .then((r) => r.json())
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/dashboard/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), bedrooms: parseInt(form.bedrooms), bathrooms: parseInt(form.bathrooms), sqft: parseInt(form.sqft) }),
    });
    setShowForm(false);
    setForm({ title: "", price: "", address: "", city: "", bedrooms: "3", bathrooms: "2", sqft: "1500", propertyType: "house", description: "" });
    load();
  };

  const deleteProperty = async (id: string) => {
    await fetch(`/api/dashboard/properties/${id}`, { method: "DELETE" });
    load();
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/dashboard/properties/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: importTab,
          url: importTab === "url" ? importUrl : undefined,
          csv: importTab === "csv" ? importCsv : undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setImportResult(`Error: ${data.error}`);
      } else {
        setImportResult(`Successfully imported ${data.imported} of ${data.total} properties!`);
        setImportUrl("");
        setImportCsv("");
        load();
      }
    } catch (e: any) {
      setImportResult(`Error: ${e.message}`);
    }
    setImporting(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Properties ({properties.length})</h1>
        <div className="flex gap-2">
          <button onClick={() => { setShowImport(!showImport); setShowForm(false); }} className="bg-purple-100 text-purple-700 px-5 py-2.5 rounded-xl font-medium hover:bg-purple-200 transition">
            Bulk Import
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowImport(false); }} className="gradient-brand text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition">
            + Add Property
          </button>
        </div>
      </div>

      {showImport && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Bulk Import Properties</h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setImportTab("url")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${importTab === "url" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              From Website URL
            </button>
            <button
              onClick={() => setImportTab("csv")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${importTab === "csv" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              From CSV
            </button>
          </div>

          {importTab === "url" && (
            <div>
              <label className="block text-sm font-medium mb-2">Your Website URL (we&apos;ll auto-detect your listings)</label>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://yourwebsite.com/listings"
                className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-500 mt-2">Enter a page with property listings. AI will extract them automatically.</p>
            </div>
          )}

          {importTab === "csv" && (
            <div>
              <label className="block text-sm font-medium mb-2">CSV Data (paste or upload)</label>
              <textarea
                value={importCsv}
                onChange={(e) => setImportCsv(e.target.value)}
                placeholder="title,price,bedrooms,bathrooms,sqft,city,propertyType,description&#10;Modern Condo,485000,2,2,1200,Miami,condo,Beautiful downtown condo"
                rows={6}
                className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
              />
              <p className="text-xs text-gray-500 mt-2">Expected columns: title, price, bedrooms, bathrooms, sqft, city, propertyType, description</p>
            </div>
          )}

          {importResult && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${importResult.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {importResult}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleImport}
              disabled={importing || (importTab === "url" ? !importUrl : !importCsv)}
              className="gradient-brand text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {importing ? "Importing..." : "Import Properties"}
            </button>
            <button onClick={() => setShowImport(false)} className="px-6 py-2 rounded-xl bg-gray-200 font-semibold hover:bg-gray-300">Cancel</button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={addProperty} className="bg-white rounded-2xl shadow-sm border p-6 mb-8 grid md:grid-cols-2 gap-4">
          <input placeholder="Property Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
          <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
          <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
          <input placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
          <input placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
          <input placeholder="Sqft" type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
          <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500">
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
          <div className="md:col-span-2">
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-brand-500" rows={3} />
          </div>
          <button type="submit" className="gradient-brand text-white py-3 rounded-xl font-semibold hover:opacity-90">Add Property</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">{p.title}</h3>
              <button onClick={() => deleteProperty(p.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
            </div>
            <div className="text-2xl font-bold text-brand-700 mb-2">${p.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500 space-y-1">
              <div>{p.address}, {p.city}</div>
              <div>{p.bedrooms} bed / {p.bathrooms} bath / {p.sqft.toLocaleString()} sqft</div>
              <div className="capitalize">{p.propertyType}</div>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-2xl border">
            No properties yet. Use &quot;Bulk Import&quot; to auto-import from your website, or &quot;+ Add Property&quot; to add manually.
          </div>
        )}
      </div>
    </div>
  );
}
