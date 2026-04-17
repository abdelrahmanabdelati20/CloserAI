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
    title: "",
    price: "",
    address: "",
    city: "",
    bedrooms: "3",
    bathrooms: "2",
    sqft: "1500",
    propertyType: "house",
    description: "",
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
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        sqft: parseInt(form.sqft),
      }),
    });
    setShowForm(false);
    setForm({ title: "", price: "", address: "", city: "", bedrooms: "3", bathrooms: "2", sqft: "1500", propertyType: "house", description: "" });
    load();
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Remove this property?")) return;
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
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <div className="text-sm text-gray-500">Loading properties...</div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-1">
            Properties
          </h1>
          <p className="text-gray-500">{properties.length} listings available to your AI agent</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowImport(!showImport); setShowForm(false); }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:border-gray-300 hover:shadow-sm transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Bulk Import
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setShowImport(false); }}
            className="group inline-flex items-center gap-2 gradient-brand text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </div>
      </div>

      {/* Bulk import panel */}
      {showImport && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Import Properties</h2>
              <p className="text-sm text-gray-500">Import from your existing website or CSV</p>
            </div>
          </div>

          <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => setImportTab("url")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                importTab === "url" ? "gradient-brand text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              From Website URL
            </button>
            <button
              onClick={() => setImportTab("csv")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                importTab === "csv" ? "gradient-brand text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              From CSV
            </button>
          </div>

          {importTab === "url" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Website URL</label>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://yourwebsite.com/listings"
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter a page with property listings. Our AI will extract them automatically.
              </p>
            </div>
          )}

          {importTab === "csv" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CSV Data</label>
              <textarea
                value={importCsv}
                onChange={(e) => setImportCsv(e.target.value)}
                placeholder="title,price,bedrooms,bathrooms,sqft,city,propertyType,description&#10;Modern Condo,485000,2,2,1200,Miami,condo,Beautiful downtown condo"
                rows={6}
                className={`${inputClass} font-mono text-xs`}
              />
              <p className="text-xs text-gray-500 mt-2">
                Expected columns: title, price, bedrooms, bathrooms, sqft, city, propertyType, description
              </p>
            </div>
          )}

          {importResult && (
            <div className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-start gap-2 ${
              importResult.startsWith("Error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                {importResult.startsWith("Error") ? (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              {importResult}
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleImport}
              disabled={importing || (importTab === "url" ? !importUrl : !importCsv)}
              className="inline-flex items-center gap-2 gradient-brand text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {importing ? "Importing..." : "Import Properties"}
            </button>
            <button
              onClick={() => setShowImport(false)}
              className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add property form */}
      {showForm && (
        <form onSubmit={addProperty} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
              <p className="text-sm text-gray-500">Manually add a property to your listings</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Title *</label>
              <input placeholder="Modern Downtown Condo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price *</label>
              <input placeholder="485000" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type</label>
              <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className={inputClass}>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <input placeholder="123 Ocean Dr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
              <input placeholder="Miami" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Square Feet</label>
              <input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                placeholder="Beautiful property with..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="flex-1 gradient-brand text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                Add Property
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Properties grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {properties.map((p) => (
          <div
            key={p.id}
            className="group bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-premium hover:-translate-y-0.5 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-900 leading-tight pr-2">{p.title}</h3>
              <button
                onClick={() => deleteProperty(p.id)}
                className="flex-shrink-0 w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="text-3xl font-bold gradient-text tracking-tight mb-3">
              ${p.price.toLocaleString("en-US")}
            </div>
            <div className="space-y-1.5 text-sm">
              {(p.address || p.city) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{[p.address, p.city].filter(Boolean).join(", ")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{p.bedrooms} bed · {p.bathrooms} bath · {p.sqft.toLocaleString("en-US")} sqft</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize border border-blue-100">
                {p.propertyType}
              </div>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No properties yet</h3>
            <p className="text-sm text-gray-500">Click &quot;Bulk Import&quot; to auto-import from your website, or &quot;Add Property&quot; to add manually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
