import React from 'react';
import { OrderItem, UserInfo } from '../types';
import { CUSTOMER_CARE_NUMBER, ORDER_PHONE_NUMBER } from '../constants';

interface OrderPanelProps {
  orderItems: OrderItem[];
  userInfo: UserInfo;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({ orderItems, userInfo }) => {
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const total = calculateTotal();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[80vh] flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">Pick-up at Sadie's Pizzeria DTLA</p>
      </div>

      {/* Customer Information */}
      {userInfo.hasProvidedDetails && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-sm font-medium text-blue-900">Customer Details</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Name:</span> {userInfo.name}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Phone:</span> {userInfo.phone}
            </p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E0 #F7FAFC' }}>
        {orderItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">
              Tell Saddie what delicious items you'd like to order!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderItems.map((item, index) => {
              const cleanedName = item.name.replace(/\*/g, '').trim();
              return (
                <div key={`${cleanedName}-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1">
                        {cleanedName}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>${item.price.toFixed(2)} each</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="space-y-3">
            
            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">${total.toFixed(2)}</span>
            </div>
            
            {/* Tax (estimated) */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Tax (est.)</span>
              <span className="font-medium text-gray-900">${(total * 0.095).toFixed(2)}</span>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-green-600">
                  ${(total * 1.095).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pickup Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-blue-900">Ready in 20-25 minutes</p>
                  <p className="text-xs text-blue-700 mt-1">922 S Olive St, Los Angeles, CA</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-3">
              {/* Order Now Button */}
              <a 
                href={`tel:${ORDER_PHONE_NUMBER}`}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Order Now
              </a>
              
              {/* Customer Support Button */}
              <a 
                href={`tel:${CUSTOMER_CARE_NUMBER}`}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Customer Support
              </a>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                📞 Need help or want to place an order? Tap to call
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
