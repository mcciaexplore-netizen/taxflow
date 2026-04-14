import { IndianRupee, Check, Star } from 'lucide-react';
import { motion } from 'motion/react';

const services = [
  {
    title: "Simple ITR",
    description: "Salary, House property & other income",
    price: "1,500",
    features: ["Salary Income", "Single House Property", "Interest/Dividend Income"],
    popular: false
  },
  {
    title: "ITR + Capital Gains",
    description: "Simple ITR + Capital gain/(loss)",
    price: "4,000",
    features: ["Everything in Simple ITR", "Stock Market Gains", "Mutual Fund Gains", "Property Sale"],
    popular: true
  },
  {
    title: "ITR + Business (Presumptive)",
    description: "Simple ITR + Business/Profession (Sec 44AD/ADA)",
    price: "5,000",
    features: ["Everything in Simple ITR", "Presumptive Taxation", "Freelance Income"],
    popular: false
  },
  {
    title: "ITR + NRI/Foreign Assets",
    description: "Simple ITR + NRI, Foreign assets/liabilities",
    price: "7,000",
    features: ["Everything in Simple ITR", "Foreign Bank Accounts", "Foreign Stock Options", "NRI Status Compliance"],
    popular: false
  },
  {
    title: "ITR + Normal Business",
    description: "Simple ITR + Normal Business/Profession income/(loss)",
    price: "10,000",
    features: ["Full P&L and Balance Sheet", "Audit Coordination", "Complex Business Income"],
    popular: false
  }
];

export default function ServiceGallery() {
  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Our Service Plans</h2>
        <span className="text-sm text-neutral-500">Transparent pricing for all your tax needs</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex flex-col bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
              service.popular ? 'border-primary ring-1 ring-primary/20' : 'border-neutral-200'
            }`}
          >
            {service.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                MOST POPULAR
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="font-bold text-neutral-900 leading-tight mb-1">{service.title}</h3>
              <p className="text-xs text-neutral-500 line-clamp-2">{service.description}</p>
            </div>

            <div className="mt-auto">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-xs font-medium text-neutral-500">Rs.</span>
                <span className="text-2xl font-bold text-neutral-900">{service.price}</span>
              </div>

              <ul className="space-y-2 mb-4">
                {service.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-neutral-600">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
