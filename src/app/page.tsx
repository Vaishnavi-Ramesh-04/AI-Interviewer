import Link from "next/link";
import { 
  Bot, Clock, CheckSquare, Users, BarChart, FileText, 
  Settings, CheckCircle2, ChevronRight, MessageSquare,
  PlayCircle, LayoutDashboard, Brain, Activity, Target
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground overflow-hidden font-sans">
      
      {/* 
        ========================================
        NAVBAR 
        ========================================
      */}
      <nav className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-2.5 h-2.5 bg-primary rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-primary/60 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-foreground rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-foreground/60 rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">AuraMock</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#solutions" className="hover:text-foreground transition-colors">Solutions</Link>
          <Link href="#resources" className="hover:text-foreground transition-colors">Resources</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link href="/auth/register" className="text-sm font-medium px-4 py-2 rounded-full border shadow-sm hover:shadow transition-shadow bg-card">
            Get started
          </Link>
        </div>
      </nav>

      {/* 
        ========================================
        HERO SECTION 
        ========================================
      */}
      <section className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-32 text-center">
        {/* The dotted pattern background layer */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.4] -z-10 rounded-3xl mt-4 mx-4"></div>

        {/* Floating Widgets (simulated with absolute positioning) */}
        <div className="hidden lg:block absolute left-[5%] top-[10%] rotate-[-6deg] animate-[float_6s_ease-in-out_infinite]">
           <div className="bg-[#fef08a] p-4 shadow-float rounded-sm w-[180px] font-mono text-xs text-left text-yellow-900 border border-yellow-200">
             <div className="w-2 h-2 rounded-full bg-red-500 absolute top-2 left-1/2 -translate-x-1/2 shadow-sm"></div>
             Take notes to keep track of crucial technical details, and accomplish more tasks with ease.
           </div>
        </div>

        <div className="hidden lg:block absolute left-[15%] top-[40%] bg-card p-3 rounded-2xl shadow-float z-10 animate-[float_8s_ease-in-out_infinite_reverse]">
           <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-inner">
             <CheckSquare className="w-6 h-6 text-white" />
           </div>
        </div>

        <div className="hidden lg:block absolute right-[10%] top-[15%] rotate-[3deg] bg-card p-4 rounded-xl shadow-float animate-[float_7s_ease-in-out_infinite]">
           <div className="flex items-center justify-between mb-3">
             <span className="font-semibold text-sm">Reminders</span>
             <span className="text-[10px] text-muted-foreground">Interviews</span>
           </div>
           <div className="bg-muted p-2 rounded-md border text-left">
             <div className="text-xs font-medium">System Design Prep</div>
             <div className="text-[10px] text-muted-foreground mt-1">Review Groq feedback</div>
             <div className="flex items-center mt-2 text-primary bg-primary/10 w-fit px-2 py-0.5 rounded text-[10px] font-medium">
               <Clock className="w-3 h-3 mr-1" /> 13:00 - 13:45
             </div>
           </div>
        </div>

        <div className="hidden lg:block absolute right-[25%] top-[8%] bg-card p-3 border rounded-2xl shadow-float-sm animate-[float_5s_ease-in-out_infinite]">
           <div className="w-8 h-8 flex items-center justify-center text-foreground">
             <Clock className="w-5 h-5" />
           </div>
        </div>

        <div className="hidden lg:block absolute left-[15%] bottom-[0%] bg-card p-4 rounded-xl shadow-float w-[240px] text-left animate-[float_7s_ease-in-out_infinite]">
          <h4 className="text-sm font-semibold mb-3">Today's reviews</h4>
          <div className="space-y-3">
             <div>
                <div className="flex items-center justify-between text-xs mb-1">
                   <div className="flex items-center"><div className="w-2 h-2 rounded bg-red-400 mr-2"></div> Backend API</div>
                   <span className="text-muted-foreground">60%</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden"><div className="w-[60%] h-full bg-primary"></div></div>
             </div>
             <div>
                <div className="flex items-center justify-between text-xs mb-1">
                   <div className="flex items-center"><div className="w-2 h-2 rounded bg-green-400 mr-2"></div> React Patterns</div>
                   <span className="text-muted-foreground">112%</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden"><div className="w-[100%] h-full bg-primary"></div></div>
             </div>
          </div>
        </div>

        {/* Central Logo Motif */}
        <div className="mx-auto w-16 h-16 bg-card rounded-2xl shadow-float flex items-center justify-center mb-8">
           <div className="grid grid-cols-2 gap-1">
             <div className="w-3 h-3 bg-primary rounded-full"></div>
             <div className="w-3 h-3 bg-foreground rounded-full"></div>
             <div className="w-3 h-3 bg-foreground rounded-full"></div>
             <div className="w-3 h-3 bg-foreground rounded-full"></div>
           </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
          Ace your interviews, <br />
          <span className="text-muted-foreground font-normal">all in one platform</span>
        </h1>
        
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Efficiently practice, analyze your facial expressions, and get targeted AI feedback to boost your confidence.
        </p>
        
        <div className="mt-10">
          <Link href="/auth/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
            Start free interview
          </Link>
        </div>
      </section>

      {/* 
        ========================================
        APP SHOWCASE 
        ========================================
      */}
      <section className="max-w-[1200px] mx-auto px-6 py-20 text-center relative z-10">
        <div className="inline-block px-3 py-1 rounded-full border bg-card text-xs font-medium text-muted-foreground mb-6">
          Solutions
        </div>
        <h2 className="text-4xl font-bold mb-16">Provide exactly what<br/>interviewers want</h2>

        {/* 3 Step Features above image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto mb-16 px-4">
          <div className="relative border-l-2 border-primary/20 pl-6 pb-8">
             <div className="absolute w-4 h-4 rounded-full bg-card border-2 border-primary -left-[9px] top-0"></div>
             <div className="text-primary mb-2"><Brain className="w-5 h-5"/></div>
             <p className="text-sm font-medium">Ensure your answers are technically sound and perfectly structured.</p>
          </div>
          <div className="relative border-l-2 border-primary/20 pl-6 pb-8">
             <div className="absolute w-4 h-4 rounded-full bg-card border-2 border-primary -left-[9px] top-0"></div>
             <div className="text-orange-500 mb-2"><LayoutDashboard className="w-5 h-5"/></div>
             <p className="text-sm font-medium">Prioritize the exact topics companies focus on what matters most.</p>
          </div>
          <div className="relative border-l-2 border-primary/20 pl-6 pb-8 border-transparent">
             <div className="absolute w-4 h-4 rounded-full bg-card border-2 border-primary -left-[9px] top-0"></div>
             <div className="text-purple-500 mb-2"><Users className="w-5 h-5"/></div>
             <p className="text-sm font-medium">Hold yourself accountable with constant scoring and check-ins.</p>
          </div>
        </div>

        {/* Dashboard Mockup Image Replacement */}
        <div className="relative mx-auto max-w-5xl">
          <div className="bg-primary pt-6 px-6 sm:pt-10 sm:px-10 rounded-t-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute -right-8 top-20 bg-card p-2 rounded-xl shadow-float z-20 flex items-center justify-center rotate-6">
              <CheckSquare className="w-8 h-8 text-success" />
            </div>
            <div className="absolute -left-6 top-32 bg-card px-4 py-2 rounded-xl shadow-float z-20 flex items-center justify-center -rotate-12 font-bold text-2xl">
              98
            </div>

            {/* Browser frame mockup */}
            <div className="bg-card rounded-t-xl border border-b-0 shadow-lg flex flex-col h-[500px] overflow-hidden">
              <div className="h-12 border-b flex items-center px-4 bg-muted/30">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex items-center text-sm font-medium"><Bot className="w-4 h-4 mr-2" /> Interview Interface</div>
              </div>
              <div className="flex-1 flex text-left">
                 <div className="w-48 border-r p-4 hidden sm:block bg-muted/10 space-y-4">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="space-y-2">
                       <div className="h-8 bg-primary/10 rounded flex items-center px-2 text-xs font-semibold text-primary">Dashboard</div>
                       <div className="h-8 hover:bg-muted/50 rounded flex items-center px-2 text-xs text-muted-foreground">Sessions</div>
                       <div className="h-8 hover:bg-muted/50 rounded flex items-center px-2 text-xs text-muted-foreground">Feedback</div>
                    </div>
                 </div>
                 <div className="flex-1 p-6 sm:p-8 bg-background relative">
                    <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">Good morning, user 👋</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2 sm:col-span-1 bg-card border rounded-xl p-4 shadow-sm">
                          <h4 className="text-sm font-semibold mb-4 border-b pb-2">To do prep</h4>
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary"/> Review sorting algorithms</div>
                             <div className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded text-primary focus:ring-primary"/> Optimize database queries</div>
                             <div className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded text-primary focus:ring-primary"/> Behavioral STAR method</div>
                          </div>
                       </div>
                       <div className="col-span-2 sm:col-span-1 space-y-4">
                          <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
                             <span className="text-xs text-muted-foreground mb-1">Last Session Time</span>
                             <span className="text-3xl font-mono">45:21</span>
                          </div>
                          <div className="bg-card border rounded-xl p-4 shadow-sm">
                             <h4 className="text-sm font-semibold mb-2">Confidence Score</h4>
                             <div className="flex items-center gap-4">
                               <div className="w-16 h-16 rounded-full border-4 border-primary border-t-primary/20 flex items-center justify-center font-bold text-lg">92</div>
                               <div className="text-xs text-muted-foreground flex-1">Your facial expressions showed high confidence during the technical section.</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        BENTO BOX FEATURES 
        ========================================
      */}
      <section className="bg-muted/30 py-24 border-y">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="inline-block px-3 py-1 rounded-full border bg-card text-xs font-medium text-muted-foreground mb-6">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Keep everything in one place</h2>
          <p className="text-muted-foreground mb-12">Forget complex study guides. We bundle it all for you.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Feature 1 */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="bg-muted rounded-2xl h-48 mb-6 flex items-center justify-center p-4 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
                 <div className="bg-card p-4 rounded-xl shadow-lg border w-full max-w-[200px] relative z-10 transform group-hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-3">
                       <Bot className="text-primary w-5 h-5"/>
                       <span className="text-xs font-semibold">AI Feedback</span>
                    </div>
                    <div className="space-y-2">
                       <div className="h-2 w-full bg-muted rounded-full"></div>
                       <div className="h-2 w-4/5 bg-muted rounded-full"></div>
                    </div>
                 </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Immediate Review</h3>
              <p className="text-sm text-muted-foreground">Work together with your AI interviewer effortlessly, receiving exact critiques after every answer.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="bg-muted rounded-2xl h-48 mb-6 flex items-center justify-center p-4 relative overflow-hidden group">
                 <div className="flex items-end gap-2 h-full py-4 text-primary w-full justify-center">
                    <div className="w-8 bg-primary rounded-t-sm h-[40%] group-hover:h-[50%] transition-all"></div>
                    <div className="w-8 bg-primary rounded-t-sm h-[70%] group-hover:h-[80%] transition-all"></div>
                    <div className="w-8 bg-primary rounded-t-sm h-[30%] group-hover:h-[60%] transition-all"></div>
                    <div className="w-8 bg-primary rounded-t-sm h-[100%] group-hover:h-[90%] transition-all"></div>
                 </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Performance Tracking</h3>
              <p className="text-sm text-muted-foreground">Optimize your time by tracking your strengths and weaknesses week over week.</p>
            </div>

            {/* Feature 3 (Wide) */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow md:col-span-2">
              <div className="bg-muted rounded-2xl h-64 mb-6 flex flex-col items-center justify-center relative overflow-hidden p-8">
                 <div className="absolute top-4 left-4 bg-orange-100 text-orange-600 p-2 rounded-xl shadow-sm">
                   <Activity className="w-6 h-6" />
                 </div>
                 <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border p-4">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Emotion Timeline</span>
                       <span className="text-xs text-primary font-medium">Session #4</span>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-success via-warning to-destructive rounded-full relative">
                       <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-card border-2 border-foreground rounded-full -translate-y-1/2"></div>
                       <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-card border-2 border-foreground rounded-full -translate-y-1/2"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                       <span>Confident</span>
                       <span>Neutral</span>
                       <span>Nervous</span>
                    </div>
                 </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced emotion tracking</h3>
              <p className="text-sm text-muted-foreground">A bird's eye view of your entire behavior and productivity through browser-native facial analysis during the interview.</p>
            </div>

          </div>
          <p className="mt-8 text-sm font-medium text-foreground hover:underline cursor-pointer">and a lot more features...</p>
        </div>
      </section>

      {/* 
        ========================================
        INTEGRATIONS 
        ========================================
      */}
      <section className="py-24 text-center max-w-[1000px] mx-auto px-6 relative">
        <div className="inline-block px-3 py-1 rounded-full border bg-card text-xs font-medium text-muted-foreground mb-6">
          Integrations
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-16">Connect technologies<br/>you use every day</h2>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 relative z-10">
           {/* Mocking the logos with colored icons */}
           <div className="w-16 h-16 md:w-20 md:h-20 bg-card rounded-2xl shadow-sm border flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
              <Bot className="w-8 h-8 text-green-600" />
           </div>
           <div className="w-16 h-16 md:w-20 md:h-20 bg-card rounded-2xl shadow-sm border flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
              <FileText className="w-8 h-8 text-blue-500" />
           </div>
           <div className="w-16 h-16 md:w-20 md:h-20 bg-card rounded-2xl shadow-sm border flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
              <MessageSquare className="w-8 h-8 text-purple-500" />
           </div>
           <div className="w-16 h-16 md:w-20 md:h-20 bg-card rounded-2xl shadow-sm border flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
              <Target className="w-8 h-8 text-red-500" />
           </div>
           <div className="w-16 h-16 md:w-20 md:h-20 bg-card rounded-2xl shadow-sm border flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
              <Settings className="w-8 h-8 text-gray-700" />
           </div>
        </div>

        {/* Vertical line connecting up in bg */}
        <div className="absolute top-[10%] left-1/2 w-[1px] h-[80%] bg-border -z-10"></div>
        <div className="absolute top-1/2 left-[10%] w-[80%] h-[1px] bg-border -z-10"></div>
      </section>

      {/* 
        ========================================
        TESTIMONIALS 
        ========================================
      */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="inline-block px-3 py-1 rounded-full border bg-card text-xs font-medium text-muted-foreground mb-6">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-16">People just like you<br/>are already using AuraMock</h2>

          <div className="columns-1 md:columns-3 gap-6 space-y-6 text-left">
            <div className="bg-card p-6 border rounded-2xl shadow-sm break-inside-avoid relative">
               <div className="absolute -left-4 top-1/2 bg-card p-2 rounded-xl shadow-md border"><MessageSquare className="w-4 h-4 text-muted-foreground"/></div>
               <p className="text-sm font-medium leading-relaxed mb-6">"This platform completely transformed the way I prep for SWE roles. I now collaborate with the AI in real-time and it catches my bad habits immediately."</p>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">JD</div>
                  <div>
                     <div className="text-sm font-semibold">John D.</div>
                     <div className="text-xs text-muted-foreground">Software Engineer</div>
                  </div>
               </div>
            </div>

            <div className="bg-card p-6 border rounded-2xl shadow-sm break-inside-avoid">
               <p className="text-sm font-medium leading-relaxed mb-6">"An essential tool for anyone looking to manage their interview nerves better."</p>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700">SW</div>
                  <div>
                     <div className="text-sm font-semibold">Sarah W.</div>
                     <div className="text-xs text-muted-foreground">Product Designer</div>
                  </div>
               </div>
            </div>

            <div className="bg-card p-6 border rounded-2xl shadow-sm break-inside-avoid">
               <p className="text-sm font-medium leading-relaxed mb-12">"The built-in analytics give me a complete overview of my communication productivity and emotional baseline."</p>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">SJ</div>
                  <div>
                     <div className="text-sm font-semibold">Sam J.</div>
                     <div className="text-xs text-muted-foreground">Project Coordinator</div>
                  </div>
               </div>
            </div>

            {/* Simulated Video Testimonial block */}
            <div className="bg-card border rounded-2xl shadow-sm break-inside-avoid overflow-hidden relative group cursor-pointer">
               <div className="aspect-[3/4] bg-muted w-full relative">
                 <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="User review" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                 <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-2 text-red-500">
                    <PlayCircle className="w-6 h-6" />
                 </div>
                 <div className="absolute bottom-4 left-4">
                    <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Watch video review</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>



      {/* 
        ========================================
        FOOTER 
        ========================================
      */}
      <footer className="relative bg-muted/20 border-t pt-24 pb-12 mt-12 overflow-hidden">
         <div className="absolute inset-0 bg-dot-pattern opacity-[0.3] -z-10"></div>
         
         {/* Scattered Footer Icons */}
         <div className="absolute top-10 left-[20%] bg-card p-3 rounded-xl border shadow-sm rotate-12"><MessageSquare className="w-5 h-5 text-muted-foreground" /></div>
         <div className="absolute top-20 left-[40%] bg-primary p-3 rounded-xl border shadow-sm -rotate-6"><CheckSquare className="w-5 h-5 text-white" /></div>
         <div className="absolute top-12 right-[30%] bg-card p-3 rounded-xl border shadow-sm rotate-6"><Clock className="w-5 h-5 text-muted-foreground" /></div>
         <div className="absolute top-24 right-[15%] bg-card p-3 rounded-xl border shadow-sm -rotate-12"><ChevronRight className="w-5 h-5 text-primary" /></div>

         <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between text-center md:text-left">
            <div className="mb-12 md:mb-0">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2h-2 bg-primary rounded-sm"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-sm"></div>
                  <div className="w-2 h-2 bg-foreground rounded-sm"></div>
                  <div className="w-2 h-2 bg-foreground/60 rounded-sm"></div>
                </div>
                <span className="font-bold text-xl tracking-tight">AuraMock</span>
              </div>
              <h2 className="text-3xl font-bold max-w-sm">Stay organized and boost your productivity</h2>
            </div>

            <div className="flex gap-16 text-sm text-foreground text-left">
               <div>
                  <ul className="space-y-4">
                     <li><a href="#" className="hover:text-primary transition-colors flex items-center -ml-2"><ChevronRight className="w-3 h-3 mr-1 opacity-50"/> About Us</a></li>
                     <li><a href="#" className="hover:text-primary transition-colors flex items-center -ml-2"><ChevronRight className="w-3 h-3 mr-1 opacity-50"/> Contact</a></li>
                     <li><a href="#" className="hover:text-primary transition-colors flex items-center -ml-2"><ChevronRight className="w-3 h-3 mr-1 opacity-50"/> What's New</a></li>
                     <li><a href="#" className="hover:text-primary transition-colors flex items-center -ml-2"><ChevronRight className="w-3 h-3 mr-1 opacity-50"/> Careers</a></li>
                  </ul>
               </div>
               <div>
                  <ul className="space-y-4">
                     <li><a href="#" className="hover:text-primary transition-colors flex items-center -ml-2"><ChevronRight className="w-3 h-3 mr-1 opacity-50"/> Product</a></li>
                     <li><a href="#" className="hover:text-primary transition-colors flex items-center -ml-2"><ChevronRight className="w-3 h-3 mr-1 opacity-50"/> Solutions</a></li>
                     <li><a href="#" className="hover:text-primary transition-colors flex items-center -ml-2"><ChevronRight className="w-3 h-3 mr-1 opacity-50"/> Integrations</a></li>
                  </ul>
               </div>
            </div>
         </div>

         <div className="max-w-[1200px] mx-auto px-6 mt-24 pt-6 border-t flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>© 2024 AuraMock. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               <a href="#" className="hover:text-foreground">Privacy Policy</a>
               <a href="#" className="hover:text-foreground">Terms of Service</a>
            </div>
         </div>
      </footer>

    </div>
  );
}
