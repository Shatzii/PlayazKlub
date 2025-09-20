import Link from "next/link";
import { getPodcasts, Podcast } from "@/lib/api";
import Navigation from "@/components/Navigation";
import FeaturedPodcasts from "@/components/FeaturedPodcasts";

export default async function Home() {
  let podcasts: Podcast[] = [];

  try {
    podcasts = await getPodcasts();
  } catch (error) {
    console.warn('Failed to fetch podcasts on server:', error);
    podcasts = []; // Ensure we have an empty array
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black" suppressHydrationWarning>
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                PlayazKlub
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your premium destination for exclusive podcasts and elite membership experiences.
              Join the club where conversations matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/podcasts"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25"
              >
                Explore Podcasts
              </Link>
              <Link
                href="/studio"
                className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🎬 Creator Studio
              </Link>
              <Link
                href="#membership"
                className="border-2 border-yellow-400/50 hover:border-yellow-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-yellow-400/10"
              >
                Join the Club
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Podcasts */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Featured Episodes</h2>
            <p className="text-gray-300 text-lg">Dive into our latest conversations</p>
          </div>

          <FeaturedPodcasts initialPodcasts={podcasts} />

          <div className="text-center mt-8">
            <Link
              href="/podcasts"
              className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium"
            >
              View All Episodes →
            </Link>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Exclusive Membership</h2>
            <p className="text-gray-300 text-lg">Unlock premium content and experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg p-8 border border-yellow-500/20 text-center hover:border-yellow-400/40 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">🎧</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Premium Episodes</h3>
              <p className="text-gray-300">Access to exclusive, members-only podcast content and early releases.</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-500/10 rounded-lg p-8 border border-yellow-400/20 text-center hover:border-yellow-400/40 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">👑</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">VIP Events</h3>
              <p className="text-gray-300">Exclusive invitations to live events, meetups, and networking opportunities.</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-400/10 rounded-lg p-8 border border-yellow-600/20 text-center hover:border-yellow-400/40 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Elite Access</h3>
              <p className="text-gray-300">Join an exclusive community of elite members and industry leaders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">About PlayazKlub</h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
              PlayazKlub is more than just a podcast platform—it&apos;s a movement. We curate conversations that matter,
              bringing together thought leaders, innovators, and visionaries to explore the topics that shape our world.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-left">
                <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
                <p className="text-gray-300">
                  To create meaningful connections through authentic conversations and provide a platform for voices that deserve to be heard.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-white mb-3">Our Vision</h3>
                <p className="text-gray-300">
                  Building a global community where ideas flow freely and every member has the opportunity to contribute to the conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">PlayazKlub</h3>
            <p className="text-gray-400 mb-6">Where conversations become connections</p>
            <div className="flex justify-center space-x-6">
              <Link href="/podcasts" className="text-gray-400 hover:text-white transition-colors">
                Podcasts
              </Link>
              <Link href="/events" className="text-gray-400 hover:text-white transition-colors">
                Live Events
              </Link>
              <Link href="/studio" className="text-gray-400 hover:text-white transition-colors">
                Studio
              </Link>
              <Link href="#membership" className="text-gray-400 hover:text-white transition-colors">
                Membership
              </Link>
              <Link href="#about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-500 text-sm">
                © 2025 PlayazKlub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
