import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Eye, 
  Brain, 
  MapPin, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Camera, 
  Bell,
  Target,
  Zap,
  FileText,
  UserCheck,
  AlertTriangle,
  Smartphone
} from "lucide-react";

const Features = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const featureCategories = [
    {
      title: "Police Operator Dashboard",
      description: "Empower frontline officers with real-time tools and coordination capabilities",
      color: "from-blue-500 to-cyan-500",
      features: [
        {
          icon: Bell,
          title: "Real-time Alerts",
          description: "Instant notifications for crimes, emergencies, and mob situations with priority classification"
        },
        {
          icon: Users,
          title: "Patrol Management",
          description: "Efficient patrol scheduling, route optimization, and team coordination tools"
        },
        {
          icon: FileText,
          title: "Lost & Found Reports",
          description: "Streamlined handling of lost and found items with digital documentation"
        },
        {
          icon: MapPin,
          title: "Live Geolocation Mapping",
          description: "Real-time incident mapping with GPS tracking and location-based insights"
        }
      ]
    },
    {
      title: "Supervisor Dashboard",
      description: "Advanced analytics and oversight tools for law enforcement leadership",
      color: "from-purple-500 to-indigo-500",
      features: [
        {
          icon: BarChart3,
          title: "Performance Metrics",
          description: "Comprehensive analytics on officer performance, response times, and case resolution"
        },
        {
          icon: Target,
          title: "Crime Heat Maps",
          description: "Visual crime pattern analysis with hotspot identification and trend monitoring"
        },
        {
          icon: Brain,
          title: "AI-Predicted Hotspots",
          description: "Machine learning algorithms predict high-risk areas for proactive deployment"
        },
        {
          icon: AlertTriangle,
          title: "Corruption Detection",
          description: "Advanced monitoring systems to identify and prevent misconduct and corruption"
        }
      ]
    },
    {
      title: "Civilian Dashboard",
      description: "User-friendly platform for citizens to interact with law enforcement",
      color: "from-green-500 to-teal-500",
      features: [
        {
          icon: FileText,
          title: "GD/FIR Submission",
          description: "Easy-to-use forms with AI chatbot guidance for proper complaint classification"
        },
        {
          icon: Camera,
          title: "Evidence Upload",
          description: "Secure upload system for photos, videos, and documents with encryption"
        },
        {
          icon: Eye,
          title: "Case Tracking",
          description: "Transparent progress tracking with priority-based queue visibility"
        },
        {
          icon: UserCheck,
          title: "Anonymous Reporting",
          description: "Safe whistleblower system ensuring complete anonymity and protection"
        }
      ]
    },
    {
      title: "AI & Automation",
      description: "Cutting-edge artificial intelligence powering smarter law enforcement",
      color: "from-orange-500 to-red-500",
      features: [
        {
          icon: MessageSquare,
          title: "AI Chatbot Assistant",
          description: "Intelligent chatbot determines complaint types and guides users through processes"
        },
        {
          icon: Zap,
          title: "Auto-Generated Drafts",
          description: "AI creates complaint drafts automatically, saving time and ensuring completeness"
        },
        {
          icon: Clock,
          title: "Priority Queue System",
          description: "Smart prioritization based on urgency, severity, and resource availability"
        },
        {
          icon: Brain,
          title: "Pattern Recognition",
          description: "Advanced AI analyzes crime patterns for predictive policing and resource allocation"
        }
      ]
    }
  ];

  // const stats = [
  //   { number: "24/7", label: "System Availability" },
  //   { number: "< 2min", label: "Average Response Time" },
  //   { number: "256-bit", label: "Encryption Security" },
  //   { number: "99.9%", label: "Uptime Guarantee" }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SEO 
        title="Features — Police Positive" 
        description="Explore key features of Police Positive." 
        canonical="/features" 
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              Powered by Advanced Technology
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 via-red-700 to-indigo-800 bg-clip-text text-transparent leading-tight mb-6"
            >
              Comprehensive Features
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-slate-600 leading-relaxed"
            >
              Discover how Police Positive transforms law enforcement with intelligent dashboards, 
              AI-powered insights, and transparent civilian engagement tools.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="container mx-auto px-6 mb-16"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50"
            >
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div> */}

      {/* Feature Categories */}
      <div className="container mx-auto px-6 pb-16">
        <div className="space-y-20">
          {featureCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              className="max-w-7xl mx-auto"
            >
              {/* Category Header */}
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <div className={`inline-block px-6 py-3 bg-gradient-to-r ${category.color} text-white rounded-full text-sm font-medium mb-4`}>
                  {category.title}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  {category.title.split(' ').slice(0, -1).join(' ')} <span className="text-red-600">{category.title.split(' ').slice(-1)}</span>
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  {category.description}
                </p>
              </motion.div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {category.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="group"
                  >
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 h-full">
                      <div className="flex items-start space-x-4">
                        <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="container mx-auto px-6 pb-16"
      >
        <div className="bg-gradient-to-r from-red-500 via-red-700 to-red-500 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get Started?
              </h2>
            </div>
            <p className="text-xl text-white-100 mb-8 max-w-2xl mx-auto">
              Experience the power of modern law enforcement technology. 
              Join the community building safer, more transparent policing.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-red-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mr-4"
            >
              Start Free Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Request Demo
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Features;