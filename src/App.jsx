import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaMapMarkerAlt, FaTrash, FaTruck, FaClipboardCheck, FaCalendarAlt, FaCreditCard } from 'react-icons/fa'
import skip4 from './assets/4skip.jpg'
import skip6 from './assets/6skip.jpg'
import skip20 from './assets/20skip.jpg'

function App() {
  const [skips, setSkips] = useState([])
  const [selectedSkip, setSelectedSkip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1500,
    showRoadOnly: false,
    showHeavyWaste: false
  })

  useEffect(() => {
    fetchSkips()
  }, [])

  const fetchSkips = async () => {
    try {
      const response = await fetch('https://app.wewantwaste.co.uk/api/skips/by-location?postcode=NR32&area=Lowestoft')
      const data = await response.json()
      setSkips(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const { minPrice, maxPrice } = useMemo(() => {
    if (skips.length === 0) return { minPrice: 0, maxPrice: 1500 }
    const prices = skips.map(skip => {
      const totalPrice = skip.price_before_vat + (skip.price_before_vat * skip.vat / 100)
      return totalPrice
    })
    return {
      minPrice: 0,
      maxPrice: 1500
    }
  }, [skips])

  const filteredSkips = useMemo(() => {
    return skips.filter(skip => {
      const totalPrice = skip.price_before_vat + (skip.price_before_vat * skip.vat / 100)
      if (totalPrice < filters.minPrice || totalPrice > filters.maxPrice) return false
      if (filters.showRoadOnly && !skip.allowed_on_road) return false
      if (filters.showHeavyWaste && !skip.allows_heavy_waste) return false
      return true
    })
  }, [skips, filters])

  const getSkipImage = (size) => {
    if (size === 4) return skip4
    if (size >= 20) return skip20
    return skip6
  }

  const SkipCard = ({ skip }) => {
    const isSelected = selectedSkip?.id === skip.id
    const totalPrice = skip.price_before_vat + (skip.price_before_vat * skip.vat / 100)
    const isMostEfficient = skip.size / skip.price_before_vat > 0.1
    const skipImage = getSkipImage(skip.size)

    return (
      <motion.div 
        className={`relative bg-gray-800 rounded-xl p-6 cursor-pointer border border-gray-700 shadow-sm
          ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md hover:border-gray-600'}
          transition-all duration-300`}
        onClick={() => setSelectedSkip(skip)}
        whileHover={{ y: -5 }}
        layout
      >
        <div className="relative">
          <div className="mb-4 rounded-lg overflow-hidden h-48">
            <img 
              src={skipImage} 
              alt={`${skip.size} Yard Skip`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {skip.size} Yard Skip
              </h3>
              <p className="text-sm text-gray-400">Hire Period: {skip.hire_period_days} days</p>
            </div>
            {isMostEfficient && (
              <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-full font-medium border border-green-800">
                Most Efficient
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Base Price</div>
              <div className="font-medium text-gray-300">£{skip.price_before_vat.toFixed(2)}</div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-400">VAT ({skip.vat}%)</div>
              <div className="text-gray-300">£{(skip.price_before_vat * skip.vat / 100).toFixed(2)}</div>
            </div>

            <div className="border-t border-gray-700 pt-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-300">Total Price</div>
                <div className="text-lg font-bold text-blue-400">
                  £{totalPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {skip.allowed_on_road && (
                <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded-full border border-blue-800">
                  Road Placement
                </span>
              )}
              {skip.allows_heavy_waste && (
                <span className="px-2 py-1 bg-purple-900/50 text-purple-400 text-xs rounded-full border border-purple-800">
                  Heavy Waste
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-blue-400 font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto pb-4">
            <div className="flex items-center min-w-fit">
              <div className="flex flex-col items-center">
                <FaMapMarkerAlt className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Postcode</span>
              </div>
              <div className="w-8 md:w-16 lg:w-24 h-0.5 bg-gray-700"></div>
            </div>

            <div className="flex items-center min-w-fit">
              <div className="flex flex-col items-center">
                <FaTrash className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Waste Type</span>
              </div>
              <div className="w-8 md:w-16 lg:w-24 h-0.5 bg-gray-700"></div>
            </div>

            <div className="flex items-center min-w-fit">
              <div className="flex flex-col items-center">
                <FaTruck className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                <span className="text-[10px] md:text-xs text-white mt-1 md:mt-2">Select Skip</span>
              </div>
              <div className="w-8 md:w-16 lg:w-24 h-0.5 bg-gray-700"></div>
            </div>

            <div className="flex items-center min-w-fit">
              <div className="flex flex-col items-center">
                <FaClipboardCheck className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Permit Check</span>
              </div>
              <div className="w-8 md:w-16 lg:w-24 h-0.5 bg-gray-700"></div>
            </div>

            <div className="flex items-center min-w-fit">
              <div className="flex flex-col items-center">
                <FaCalendarAlt className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Choose Date</span>
              </div>
              <div className="w-8 md:w-16 lg:w-24 h-0.5 bg-gray-700"></div>
            </div>

            <div className="flex items-center min-w-fit">
              <div className="flex flex-col items-center">
                <FaCreditCard className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Skip Size</h1>
          <p className="text-gray-400">Select the skip size that best suits your needs</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Price Range</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Price: £{filters.minPrice}
                  </label>
                  <input 
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Price: £{filters.maxPrice}
                  </label>
                  <input 
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="roadOnly"
                    checked={filters.showRoadOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, showRoadOnly: e.target.checked }))}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                  />
                  <label htmlFor="roadOnly" className="text-sm text-gray-300">
                    Road Placement Only
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="heavyWaste"
                    checked={filters.showHeavyWaste}
                    onChange={(e) => setFilters(prev => ({ ...prev, showHeavyWaste: e.target.checked }))}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                  />
                  <label htmlFor="heavyWaste" className="text-sm text-gray-300">
                    Heavy Waste Compatible
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSkips.map(skip => (
                <SkipCard key={skip.id} skip={skip} />
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedSkip && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-8 md:right-8 md:left-auto bg-gray-800 rounded-t-xl md:rounded-xl p-4 md:p-6 shadow-lg border-t md:border border-gray-700 w-full md:w-96"
            >
              <div className="space-y-4 max-w-7xl mx-auto md:max-w-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{selectedSkip.size} Yard Skip</h3>
                    <p className="text-sm text-gray-400">Hire Period: {selectedSkip.hire_period_days} days</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Continue
                  </button>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Base Price</span>
                    <span className="text-gray-300">£{selectedSkip.price_before_vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">VAT ({selectedSkip.vat}%)</span>
                    <span className="text-gray-300">£{(selectedSkip.price_before_vat * selectedSkip.vat / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-gray-700">
                    <span className="text-white">Total Price</span>
                    <span className="text-blue-400">£{(selectedSkip.price_before_vat + (selectedSkip.price_before_vat * selectedSkip.vat / 100)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 italic border-t border-gray-700 pt-4">
                  <p>Imagery and information shown throughout this website may not reflect the exact shape or size specification, colours may vary, options and/or accessories may be featured at additional cost.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
