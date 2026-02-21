export default function AdCard({ isDark, featured }) {
    return (
        <div className={`premium-card overflow-hidden group ${isDark ? "bg-neutral-900" : "bg-white"}`}>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Featured Partner</p>
                </div>
                <div className="relative overflow-hidden rounded-xl mb-6">
                    <img src="https://skcinfotech.in/images/banner/ban1.png" alt="ads" className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <h4 className="font-bold text-lg leading-tight mb-2">Grow your business with PayPal Vision</h4>
                <p className="opacity-60 text-sm mb-6 leading-relaxed">Unlock global payments and secure transactions with our next-gen API integration.</p>
                <button className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all ${isDark ? "bg-white/5 text-white" : "bg-neutral-100 text-black"}`}>Learn More</button>
            </div>
        </div>
    );
}
