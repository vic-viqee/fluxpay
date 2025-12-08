import React from 'react';

interface Plan {
  name: string;
  price: string;
  features: string[];
  cta: string;
  ariaLabel: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isSelected, onSelect }) => {
  const isEnterprise = plan.name === 'Enterprise';

  const cardClasses = `
    flex flex-col p-6 border rounded-xl h-full transition-all duration-300
    ${isSelected
      ? 'border-purple-600 shadow-2xl transform -translate-y-2'
      : 'border-gray-200 hover:shadow-lg hover:-translate-y-1'
    }
    ${plan.popular ? 'bg-purple-50' : 'bg-white'}
  `;

  return (
    <div className={cardClasses} onClick={() => onSelect(plan.name)}>
      {plan.popular && (
        <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
            <span className="inline-block px-4 py-1 text-sm font-semibold text-white bg-purple-600 rounded-full">
                Most Popular
            </span>
        </div>
      )}
      
      <div className="flex-grow">
        <h3 className="text-2xl font-semibold text-gray-900 text-left mb-4">{plan.name}</h3>
        <p className="text-4xl font-extrabold text-gray-900 text-left mb-2">{plan.price}</p>
        {!isEnterprise && <p className="text-gray-500 text-left mb-6">/ month</p>}
        {isEnterprise && <p className="text-gray-500 text-left mb-6">Let's talk</p>}
        
        <ul className="space-y-4 text-gray-600 mb-8 text-left">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-label={plan.ariaLabel}
        className={`w-full mt-auto text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-300 cursor-pointer ${isSelected ? 'bg-purple-600 text-white' : 'bg-white border border-purple-600 text-purple-600'}`}
        onClick={() => onSelect(plan.name)} // Make this div explicitly clickable
      >
        {isSelected ? 'Selected' : plan.cta}
      </div>
    </div>
  );
};

export default PricingCard;
