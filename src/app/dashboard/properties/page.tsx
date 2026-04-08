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

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Properties ({properties.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="gradient-brand text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition">
          + Add Property
        </button>
      </div>

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
          <div className="col-span-full text-center py-12 text-gray-400">No properties yet. Add your listings so the AI can recommend them.</div>
        )}
      </div>
    </div>
  );
}
