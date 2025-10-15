import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "@/assets/exam-scheduler.json";

export default function Home() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      {/* background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black -z-10" />

      {/* decorative blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px] opacity-20 -z-10" />

      {/* content */}
      <div className="max-w-3xl px-6 flex flex-col items-center">
        {/* 👇 Animation now comes first */}
        <div className="flex justify-center mb-8">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            className="w-72 h-72 md:w-96 md:h-96"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          VICTVS Exam Scheduler
        </h1>

        <p className="mb-6 text-lg text-muted-foreground">
          Manage, monitor, and track your global exam sessions effortlessly — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-primary text-primary-foreground">
            <Link to="/sessions">
              View Sessions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/map">View Map</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
