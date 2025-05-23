"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      className="w-full relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <footer className="w-full bg-white text-black py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Bluebird Edu</h3>
              <p className="text-black-400">
                Helping aviation professionals excel in their certification exams.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-black-400 hover:text-gray-500">Home</Link></li>
                <li><Link href="#features" className="text-black-400 hover:text-gray-500">Features</Link></li>
                <li><Link href="#pricing" className="text-black-400 hover:text-gray-500">Pricing</Link></li>
                <li><Link href="#about" className="text-black-400 hover:text-gray-500">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-black-400 hover:text-gray-500">Contact Us</Link></li>
                <li><Link href="#" className="text-black-400 hover:text-gray-500">Terms of Service</Link></li>
                <li><Link href="#" className="text-black-400 hover:text-gray-500">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Disclaimer</h3>
              <p className="text-black-400 mb-2">
              The material on this site is for training purposes only. Do not use it for flight! <br/><br/>Please note that <a className="text-blue-600" href="https://bluebirdedu.com">bluebirdedu.com</a> is not affiliated in any way with any airplane manufacturer Company.
              </p>
            </div>
          </div>
          
          <div className="w-full border-t border-black-700 mt-12 pt-6 text-center text-black-400 text-sm">
            © {new Date().getFullYear()} Bluebird Edu. All rights reserved. Created by Preetham Fernandes at <a className="text-blue-600" href="https://onebasketmarketing.com">One Basket Marketing-India</a>.
          </div>
        </div>
      </footer>
    </motion.footer>
  )
}