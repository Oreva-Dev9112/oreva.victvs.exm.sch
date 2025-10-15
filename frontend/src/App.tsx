import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Sessions from "@/pages/Sessions";
import Map from "@/pages/Map";

export default function App() {
  return (
    <div className="dark">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </Layout>
    </div>
  );
}
