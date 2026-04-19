import React, { useState } from 'react';
import { Coins, Shield, Scroll, Sword, TrendingDown, TrendingUp, Clock, AlertTriangle, Calendar, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function SpendalotDashboard() {
  const [selectedAccount, setSelectedAccount] = useState('primary');
  const [transactionType, setTransactionType] = useState('daily');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSirTip, setShowSirTip] = useState(false);
  const [selectedProphecy, setSelectedProphecy] = useState(null);
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');

  // Dummy data
  const accounts = [
    { id: 'primary', name: 'Royal Treasury', balance: 1247.50, type: 'checking', isPrimary: true },
    { id: 'savings', name: 'Dragon Hoard', balance: 5430.00, type: 'savings', isPrimary: false },
    { id: 'cash', name: 'Coin Purse', balance: 85.20, type: 'cash', isPrimary: false }
  ];

  const currentAccount = accounts.find(a => a.id === selectedAccount);

  const todayStats = {
    actualBalance: 1247.50,
    predictedBalance: 1189.30,
    spentToday: {
      daily: 24.80,
      unplanned: 45.00,
      predicted: 0,
      total: 69.80
    },
    dailyAverage: 24.80
  };

  const lowestPoints = [
    { date: '2025-05-23', amount: 324.60, daysUntil: 12 },
    { date: '2025-06-15', amount: 89.40, daysUntil: 35 }
  ];

  const recentTransactions = [
    { id: 1, desc: 'Alphamega Provisions', amount: -23.40, category: 'Groceries', subcategory: 'Fresh produce', type: 'daily', time: '14:32' },
    { id: 2, desc: 'Bus Fare to Castle', amount: -1.50, category: 'Transportation', subcategory: 'Public transit', type: 'daily', time: '09:15' },
    { id: 3, desc: 'Tavern Lunch', amount: -12.50, category: 'Dining', subcategory: null, type: 'daily', time: '13:00' },
    { id: 4, desc: 'Blacksmith Repair', amount: -45.00, category: 'Maintenance', subcategory: null, type: 'unplanned', time: '11:20' },
    { id: 5, desc: 'Royal Payslip', amount: 2200.00, category: 'Salary', subcategory: null, type: 'predicted', time: 'May 1' }
  ];

  const upcomingPredictions = [
    { id: 1, desc: 'Cyta Bill', amount: -45.00, date: 'May 27', status: 'pending', category: 'Utilities' },
    { id: 2, desc: 'Spotify Subscription', amount: -9.99, date: 'May 15', status: 'pending', category: 'Entertainment' },
    { id: 3, desc: 'Road Tax', amount: -183.00, date: 'Jul 1', status: 'pending', category: 'Transportation' }
  ];

  const categories = {
    daily: ['Groceries', 'Transportation', 'Dining', 'Entertainment'],
    unplanned: ['Medical', 'Maintenance', 'Gifts', 'Other'],
    predicted: upcomingPredictions.map(p => ({ id: p.id, name: p.desc }))
  };

  const subcategories = {
    'Groceries': ['Fresh produce', 'Packaged goods', 'Beverages'],
    'Transportation': ['Public transit', 'Gas', 'Parking'],
    'Dining': ['Lunch', 'Dinner', 'Coffee'],
  };

  const sirTips = [
    "Hark! Thou hast spent 20% more than thy average this week!",
    "Thy treasury doth prosper! Well managed, noble steward!",
    "Beware! Thine lowest fortune approacheth in 12 days hence!",
    "Methinks thou shouldst review thy tavern expenses...",
    "A knight's wisdom: Save today, feast tomorrow!"
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%)',
      fontFamily: "'Cinzel', serif",
      color: '#f4e4c1',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'fixed',
        top: '10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139,69,19,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header with Sir Spendalot Badge */}
      <header style={{
        textAlign: 'center',
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '1.5rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(139,69,19,0.3) 0%, rgba(101,67,33,0.3) 100%)',
          border: '3px solid #d4af37',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
          }} />
          
          {/* Coin Purse Icon */}
          <Coins size={48} color="#d4af37" strokeWidth={2} />

          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              SIR SPENDALOT
            </h1>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#c9a961',
              fontFamily: "'Crimson Text', serif"
            }}>
              Guardian of thy Treasury
            </p>
          </div>
          <Shield size={48} color="#d4af37" strokeWidth={2} />
        </div>
      </header>

      {/* Account Selector */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccount(acc.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedAccount === acc.id 
                ? 'linear-gradient(135deg, #8b4513 0%, #654321 100%)' 
                : 'rgba(139,69,19,0.2)',
              border: selectedAccount === acc.id ? '2px solid #d4af37' : '2px solid rgba(212,175,55,0.3)',
              borderRadius: '6px',
              color: '#f4e4c1',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              transition: 'all 0.3s ease',
              boxShadow: selectedAccount === acc.id ? '0 4px 16px rgba(212,175,55,0.3)' : 'none',
              position: 'relative'
            }}
          >
            {acc.name}
            {acc.isPrimary && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#d4af37',
                color: '#1a0f0a',
                fontSize: '0.65rem',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                fontWeight: 700
              }}>⭐</span>
            )}
          </button>
        ))}
      </div>

      {/* Dashboard Grid - Primary Account */}
      {currentAccount?.isPrimary ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          
          {/* This Day's Fortune - Enhanced */}
          <div className="card" style={cardStyle}>
            <div style={cardHeaderStyle}>
              <Scroll size={24} color="#d4af37" />
              <h2 style={cardTitleStyle}>This Day's Fortune</h2>
              <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#c9a961' }}>
                Daily Avg: €{todayStats.dailyAverage.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#c9a961', marginBottom: '0.5rem' }}>
                    Actual Sum
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4ade80' }}>
                    €{todayStats.actualBalance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#c9a961', marginBottom: '0.5rem' }}>
                    Predicted Sum
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d4af37' }}>
                    €{todayStats.predictedBalance.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                borderLeft: '3px solid #cd5c5c'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f4e4c1' }}>
                  Spent Today
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ color: '#c9a961' }}>Daily:</div>
                  <div style={{ textAlign: 'right', color: '#cd5c5c' }}>€{todayStats.spentToday.daily.toFixed(2)}</div>
                  
                  <div style={{ color: '#c9a961' }}>Unplanned:</div>
                  <div style={{ textAlign: 'right', color: '#cd5c5c' }}>€{todayStats.spentToday.unplanned.toFixed(2)}</div>
                  
                  <div style={{ color: '#c9a961' }}>Predicted:</div>
                  <div style={{ textAlign: 'right', color: '#cd5c5c' }}>€{todayStats.spentToday.predicted.toFixed(2)}</div>
                  
                  <div style={{ color: '#c9a961', fontWeight: 700, borderTop: '1px solid rgba(201,169,97,0.3)', paddingTop: '0.5rem' }}>Total:</div>
                  <div style={{ textAlign: 'right', color: '#cd5c5c', fontWeight: 700, borderTop: '1px solid rgba(201,169,97,0.3)', paddingTop: '0.5rem' }}>€{todayStats.spentToday.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Thy Lowest Fortune - Dual Display */}
          <div className="card" style={{
            ...cardStyle,
            background: lowestPoints[0].amount < 0 
              ? 'linear-gradient(135deg, rgba(139,0,0,0.3) 0%, rgba(101,67,33,0.3) 100%)'
              : 'linear-gradient(135deg, rgba(139,69,19,0.2) 0%, rgba(101,67,33,0.3) 100%)',
            borderColor: lowestPoints[0].amount < 0 ? '#cd5c5c' : 'rgba(212,175,55,0.3)'
          }}>
            <div style={cardHeaderStyle}>
              <AlertTriangle size={24} color={lowestPoints[0].amount < 0 ? '#cd5c5c' : '#d4af37'} />
              <h2 style={{ ...cardTitleStyle, color: lowestPoints[0].amount < 0 ? '#cd5c5c' : '#d4af37' }}>
                Thy Lowest Fortunes
              </h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {lowestPoints.map((point, idx) => (
                <div key={idx} style={{ marginBottom: idx === 0 ? '1.5rem' : '0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c9a961', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {idx === 0 ? 'Next Peril' : 'Following Peril'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: 700, 
                      color: point.amount < 0 ? '#cd5c5c' : '#d4af37' 
                    }}>
                      €{point.amount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#c9a961' }}>
                      in {point.daysUntil} days
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#c9a961' }}>
                    {point.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Record Thy Deed - Enhanced with Predicted Support */}
          <div className="card" style={cardStyle} data-form="record-deed">
            <div style={cardHeaderStyle}>
              <Coins size={24} color="#d4af37" />
              <h2 style={cardTitleStyle}>Record Thy Deed</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Transaction Type Selector */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Type of Deed</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['daily', 'unplanned', 'predicted'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTransactionType(type)}
                        style={{
                          ...buttonStyle,
                          flex: 1,
                          background: transactionType === type 
                            ? 'linear-gradient(135deg, #8b4513 0%, #654321 100%)'
                            : 'rgba(139,69,19,0.2)',
                          border: transactionType === type 
                            ? '2px solid #d4af37' 
                            : '2px solid rgba(212,175,55,0.3)',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Category/Template Selector */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>
                    {transactionType === 'predicted' ? 'Template or Category' : 'Category'}
                  </label>
                  <select 
                    style={inputStyle}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {transactionType === 'predicted' ? (
                      <>
                        <option value="">-- Create New --</option>
                        {categories.predicted.map(pred => (
                          <option key={pred.id} value={pred.id}>{pred.name}</option>
                        ))}
                      </>
                    ) : (
                      categories[transactionType].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Subcategory - only for daily/unplanned */}
                {transactionType !== 'predicted' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Subcategory (optional)</label>
                    <input
                      type="text"
                      list="subcategories"
                      placeholder="Type or select..."
                      style={inputStyle}
                    />
                    <datalist id="subcategories">
                      {subcategories['Groceries']?.map(sub => (
                        <option key={sub} value={sub} />
                      ))}
                    </datalist>
                  </div>
                )}

                {/* Date Picker - Collapsible */}
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    style={{
                      ...buttonStyle,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(0,0,0,0.2)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="#d4af37" />
                      Date: {showDatePicker ? selectedDate : 'Today'}
                    </span>
                    {showDatePicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showDatePicker && (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '0.5rem'
                      }}
                    />
                  )}
                </div>

                {/* Submit Button */}
                <button type="submit" style={{
                  ...buttonStyle,
                  width: '100%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                  color: '#1a0f0a',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '0.875rem'
                }}>
                  Submit Entry
                </button>
              </form>
            </div>
          </div>

          {/* Recent Chronicles */}
          <div className="card" style={{ ...cardStyle, gridColumn: 'span 2' }}>
            <div style={cardHeaderStyle}>
              <Clock size={24} color="#d4af37" />
              <h2 style={cardTitleStyle}>Recent Chronicles</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentTransactions.map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '6px',
                      borderLeft: `3px solid ${tx.amount > 0 ? '#4ade80' : '#cd5c5c'}`
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {tx.desc}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#c9a961' }}>
                        {tx.category}{tx.subcategory ? ` → ${tx.subcategory}` : ''} • {tx.type} • {tx.time}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: tx.amount > 0 ? '#4ade80' : '#cd5c5c'
                    }}>
                      {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Future Prophecies */}
          <div className="card" style={cardStyle}>
            <div style={cardHeaderStyle}>
              <TrendingDown size={24} color="#d4af37" />
              <h2 style={cardTitleStyle}>Future Prophecies</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingPredictions.map((pred) => (
                  <div
                    key={pred.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.875rem',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                    onClick={() => {
                      setTransactionType('predicted');
                      setSelectedProphecy(pred);
                      setFormAmount(Math.abs(pred.amount).toString());
                      setFormCategory(pred.id.toString());
                      setSelectedDate(pred.date);
                      // Scroll to form
                      setTimeout(() => {
                        document.querySelector('[data-form="record-deed"]')?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }, 100);
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {pred.desc}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#c9a961' }}>
                        {pred.category} • {pred.date}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#cd5c5c' }}>
                      €{Math.abs(pred.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        // Dashboard Grid - Non-Primary Account (Simplified)
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          
          {/* Current Balance Only */}
          <div className="card" style={cardStyle}>
            <div style={cardHeaderStyle}>
              <Coins size={24} color="#d4af37" />
              <h2 style={cardTitleStyle}>Current Balance</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#4ade80', textAlign: 'center' }}>
                €{currentAccount.balance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Recent Chronicles */}
          <div className="card" style={{ ...cardStyle, gridColumn: 'span 2' }}>
            <div style={cardHeaderStyle}>
              <Clock size={24} color="#d4af37" />
              <h2 style={cardTitleStyle}>Recent Chronicles</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentTransactions.slice(0, 3).map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '6px',
                      borderLeft: `3px solid ${tx.amount > 0 ? '#4ade80' : '#cd5c5c'}`
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {tx.desc}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#c9a961' }}>
                        {tx.category} • {tx.time}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: tx.amount > 0 ? '#4ade80' : '#cd5c5c'
                    }}>
                      {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Future Prophecies */}
          <div className="card" style={cardStyle}>
            <div style={cardHeaderStyle}>
              <TrendingDown size={24} color="#d4af37" />
              <h2 style={cardTitleStyle}>Future Prophecies</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingPredictions.map((pred) => (
                  <div
                    key={pred.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.875rem',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {pred.desc}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#c9a961' }}>
                        {pred.date}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#cd5c5c' }}>
                      €{Math.abs(pred.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating Sir Spendalot Advisor */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '120px',
          height: '120px',
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          setShowSirTip(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          setShowSirTip(false);
        }}
        onClick={() => setShowSirTip(!showSirTip)}
      >
        {/* Badge placeholder - replace with actual image */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '4px solid #d4af37',
          background: '#f4e4c1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(212,175,55,0.5)',
          fontSize: '0.6rem',
          textAlign: 'center',
          color: '#2d1810',
          fontWeight: 700,
          position: 'relative'
        }}>
          SIR<br/>SPENDALOT<br/>BADGE
          
          {/* Pulsing glow effect */}
          <div style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)',
            animation: 'pulse 2s infinite'
          }} />
        </div>

        {/* Tip Bubble */}
        {showSirTip && (
          <div style={{
            position: 'absolute',
            bottom: '140px',
            right: '-80px',
            width: '300px',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(139,69,19,0.98) 0%, rgba(101,67,33,0.98) 100%)',
            border: '3px solid #d4af37',
            borderRadius: '12px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            fontSize: '0.9rem',
            fontFamily: "'Crimson Text', serif",
            fontStyle: 'italic',
            color: '#f4e4c1',
            animation: 'fadeIn 0.3s ease',
            transform: 'rotate(0deg)',
            zIndex: 1001
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <Info size={24} color="#d4af37" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <div style={{ lineHeight: '1.5' }}>
                {sirTips[Math.floor(Math.random() * sirTips.length)]}
              </div>
            </div>
            {/* Speech bubble arrow */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '-12px',
              width: '0',
              height: '0',
              borderTop: '12px solid transparent',
              borderBottom: '12px solid transparent',
              borderLeft: '12px solid #8b4513'
            }} />
          </div>
        )}
      </div>

      {/* Footer motto */}
      <div style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '1.5rem',
        borderTop: '2px solid rgba(212,175,55,0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{
          fontSize: '0.875rem',
          fontStyle: 'italic',
          color: '#c9a961',
          letterSpacing: '0.1em',
          fontFamily: "'Crimson Text', serif"
        }}>
          "He who guards his gold, guards his glory"
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Shared styles
const cardStyle = {
  background: 'linear-gradient(135deg, rgba(139,69,19,0.2) 0%, rgba(101,67,33,0.3) 100%)',
  border: '2px solid rgba(212,175,55,0.3)',
  borderRadius: '8px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  overflow: 'hidden',
  position: 'relative'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1.25rem 1.5rem',
  borderBottom: '2px solid rgba(212,175,55,0.2)',
  background: 'rgba(0,0,0,0.2)'
};

const cardTitleStyle = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  color: '#d4af37'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  marginBottom: '0.5rem',
  color: '#c9a961',
  letterSpacing: '0.05em'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'rgba(0,0,0,0.3)',
  border: '2px solid rgba(212,175,55,0.3)',
  borderRadius: '6px',
  color: '#f4e4c1',
  fontFamily: "'Cinzel', serif",
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.3s ease',
  boxSizing: 'border-box'
};

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  background: 'rgba(139,69,19,0.3)',
  border: '2px solid rgba(212,175,55,0.3)',
  borderRadius: '6px',
  color: '#f4e4c1',
  cursor: 'pointer',
  fontFamily: "'Cinzel', serif",
  fontSize: '0.875rem',
  letterSpacing: '0.05em',
  transition: 'all 0.3s ease'
};
