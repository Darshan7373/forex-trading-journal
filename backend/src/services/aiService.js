/**
 * ═══════════════════════════════════════════════════════════════════════
 * AI ANALYSIS SERVICE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * This service analyzes forex trades using intelligent rule-based logic.
 * It's designed to be easily upgraded to use LLM APIs (OpenAI, Anthropic, etc.)
 * 
 * 🔌 LLM INTEGRATION POINTS are marked throughout the code
 * 
 * Current Features:
 * - Trade execution quality scoring (1-10)
 * - Rule adherence checking
 * - Emotional pattern detection
 * - Risk assessment
 * - Pattern recognition (FOMO, revenge trading, over-trading, etc.)
 * - Personalized improvement suggestions
 * 
 * Future: Replace rule-based logic with LLM API calls for more nuanced analysis
 */

class AIAnalysisService {
  
  /**
   * Analyze a single trade and generate AI feedback
   * @param {Object} trade - Trade object from database
   * @param {Array} userTrades - User's trading history for context
   * @returns {Object} AI feedback object
   */
  async analyzeTrade(trade, userTrades = []) {
    // 🔌 LLM INTEGRATION POINT #1
    // Replace this entire method with LLM API call for sophisticated analysis
    // Example: const analysis = await this.llmAnalyzeTrade(trade, userTrades);
    
    const analysis = {
      executionScore: this.calculateExecutionScore(trade),
      strengths: this.identifyStrengths(trade),
      mistakes: this.identifyMistakes(trade),
      suggestion: this.generateSuggestion(trade),
      patterns: this.detectPatterns(trade, userTrades),
      riskAssessment: this.assessRisk(trade),
      emotionalState: this.analyzeEmotions(trade),
      analyzedAt: new Date()
    };
    
    return analysis;
  }
  
  /**
   * Calculate execution quality score (1-10)
   */
  calculateExecutionScore(trade) {
    let score = 5; // Base score
    
    // R:R Ratio Quality (+2 to -1)
    if (trade.rrRatio >= 3) score += 2;
    else if (trade.rrRatio >= 2) score += 1;
    else if (trade.rrRatio < 1) score -= 1;
    
    // Risk Management (+1 to -2)
    if (trade.riskPercentage <= 1) score += 1;
    else if (trade.riskPercentage > 3) score -= 2;
    else if (trade.riskPercentage > 2) score -= 1;
    
    // Outcome Quality (+2 to -1)
    if (trade.outcome === 'Win' && trade.pips > 20) score += 2;
    else if (trade.outcome === 'Win') score += 1;
    else if (trade.outcome === 'Loss' && Math.abs(trade.pips) > 30) score -= 1;
    
    // Stop Loss Discipline (+1)
    const actualRR = Math.abs(trade.entryPrice - trade.stopLoss);
    if (actualRR > 0 && trade.stopLoss !== trade.entryPrice) score += 1;
    
    // Emotional Discipline (-2 if negative emotions)
    if (this.hasNegativeEmotions(trade)) score -= 2;
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }
  
  /**
   * Identify trade strengths
   */
  identifyStrengths(trade) {
    const strengths = [];
    
    if (trade.rrRatio >= 2) {
      strengths.push('Good risk-to-reward ratio');
    }
    
    if (trade.riskPercentage <= 1) {
      strengths.push('Conservative position sizing');
    }
    
    if (trade.outcome === 'Win' && trade.pips > 30) {
      strengths.push('Strong profit target execution');
    }
    
    if (!this.hasNegativeEmotions(trade)) {
      strengths.push('Maintained emotional discipline');
    }
    
    if (trade.stopLoss && trade.takeProfit) {
      strengths.push('Proper risk management with SL/TP');
    }
    
    const emotionsBefore = (trade.emotionsBefore || '').toLowerCase();
    if (emotionsBefore.includes('calm') || emotionsBefore.includes('confident')) {
      strengths.push('Entered trade with positive mindset');
    }
    
    if (strengths.length === 0) {
      strengths.push('Trade logged for analysis');
    }
    
    return strengths;
  }
  
  /**
   * Identify mistakes and violations
   */
  identifyMistakes(trade) {
    const mistakes = [];
    
    if (trade.rrRatio < 1) {
      mistakes.push('Risk-to-reward ratio below 1:1 - risking more than potential gain');
    }
    
    if (trade.riskPercentage > 2) {
      mistakes.push(`High risk percentage (${trade.riskPercentage}%) - exceeds recommended 1-2%`);
    }
    
    if (trade.outcome === 'Loss' && this.hasRevengeEmotions(trade)) {
      mistakes.push('Possible revenge trading detected from emotional state');
    }
    
    if (this.hasFOMOIndicators(trade)) {
      mistakes.push('FOMO (Fear of Missing Out) indicators present');
    }
    
    const emotionsDuring = (trade.emotionsDuring || '').toLowerCase();
    if (emotionsDuring.includes('panic') || emotionsDuring.includes('fear')) {
      mistakes.push('Emotional panic during trade execution');
    }
    
    if (trade.outcome === 'Loss' && Math.abs(trade.pips) > trade.rrRatio * 20) {
      mistakes.push('Stop loss may have been too wide or not honored');
    }
    
    if (trade.notes && trade.notes.toLowerCase().includes('impulsive')) {
      mistakes.push('Self-identified impulsive entry');
    }
    
    return mistakes;
  }
  
  /**
   * Generate personalized improvement suggestion
   */
  generateSuggestion(trade) {
    // 🔌 LLM INTEGRATION POINT #2
    // LLM can generate highly personalized, context-aware suggestions
    
    const mistakes = this.identifyMistakes(trade);
    
    // Priority-based suggestions
    if (trade.riskPercentage > 3) {
      return 'Focus on reducing position size to 1-2% risk per trade. This is critical for capital preservation.';
    }
    
    if (trade.rrRatio < 1) {
      return 'Never enter trades with R:R below 1:1. Wait for setups with at least 2:1 reward potential.';
    }
    
    if (this.hasRevengeEmotions(trade)) {
      return 'Take a break after losses. Wait at least 30 minutes before analyzing the next setup.';
    }
    
    if (this.hasFOMOIndicators(trade)) {
      return 'Use entry checklists to avoid FOMO. The market always provides opportunities.';
    }
    
    if (trade.outcome === 'Loss' && mistakes.length > 0) {
      return 'Review your trading plan rules. Stick to your strategy even during drawdowns.';
    }
    
    if (trade.outcome === 'Win' && trade.rrRatio >= 2) {
      return 'Excellent trade! Document what made this setup high-probability and repeat it.';
    }
    
    return 'Continue journaling trades. Pattern recognition improves with consistent data.';
  }
  
  /**
   * Detect trading patterns
   */
  detectPatterns(trade, userTrades = []) {
    const patterns = [];
    
    // Current trade patterns
    if (trade.riskPercentage <= 1 && trade.rrRatio >= 2) {
      patterns.push('good_discipline');
    }
    
    if (this.hasRevengeEmotions(trade)) {
      patterns.push('revenge_trading');
    }
    
    if (this.hasFOMOIndicators(trade)) {
      patterns.push('FOMO');
    }
    
    if (this.hasNegativeEmotions(trade)) {
      patterns.push('emotional_trading');
    }
    
    // Historical pattern detection
    if (userTrades.length >= 3) {
      const recentTrades = userTrades.slice(0, 5);
      
      // Over-trading detection
      const sameDayTrades = recentTrades.filter(t => 
        t.date.toDateString() === trade.date.toDateString()
      );
      if (sameDayTrades.length >= 3) {
        patterns.push('over_trading');
      }
      
      // Early exit pattern
      const recentWins = recentTrades.filter(t => t.outcome === 'Win');
      if (recentWins.length >= 2 && recentWins.every(t => t.pips < 15)) {
        patterns.push('early_exit');
      }
      
      // Late entry pattern
      const recentLosses = recentTrades.filter(t => t.outcome === 'Loss');
      if (recentLosses.length >= 2) {
        patterns.push('late_entry');
      }
    }
    
    return patterns;
  }
  
  /**
   * Assess risk management quality
   */
  assessRisk(trade) {
    const score = this.calculateExecutionScore(trade);
    
    if (score >= 8 && trade.riskPercentage <= 1 && trade.rrRatio >= 2) {
      return 'excellent';
    }
    
    if (score >= 6 && trade.riskPercentage <= 2) {
      return 'good';
    }
    
    if (trade.riskPercentage <= 3 && trade.rrRatio >= 1) {
      return 'acceptable';
    }
    
    if (trade.riskPercentage > 3 || trade.rrRatio < 1) {
      return 'poor';
    }
    
    return 'dangerous';
  }
  
  /**
   * Analyze emotional state
   */
  analyzeEmotions(trade) {
    const allEmotions = [
      trade.emotionsBefore || '',
      trade.emotionsDuring || '',
      trade.emotionsAfter || ''
    ].join(' ').toLowerCase();
    
    if (allEmotions.includes('revenge') || allEmotions.includes('angry')) {
      return 'revenge';
    }
    
    if (allEmotions.includes('fomo') || allEmotions.includes('missing out')) {
      return 'greedy';
    }
    
    if (allEmotions.includes('fear') || allEmotions.includes('panic')) {
      return 'fearful';
    }
    
    if (allEmotions.includes('impulsive') || allEmotions.includes('rushed')) {
      return 'impulsive';
    }
    
    if (allEmotions.includes('confident') && !allEmotions.includes('over')) {
      return 'confident';
    }
    
    if (allEmotions.includes('calm') || allEmotions.includes('patient')) {
      return 'calm';
    }
    
    return 'mixed';
  }
  
  /**
   * Generate weekly or monthly AI review
   * @param {Array} trades - Trades in the period
   * @param {String} period - 'weekly' or 'monthly'
   */
  async generatePeriodReview(trades, period = 'weekly') {
    // 🔌 LLM INTEGRATION POINT #3
    // LLM can generate comprehensive, narrative-style reviews
    // Example: return await this.llmGenerateReview(trades, period);
    
    if (trades.length === 0) {
      return {
        period,
        summary: 'No trades recorded in this period',
        recommendations: ['Start logging your trades to unlock AI insights']
      };
    }
    
    // Calculate statistics
    const stats = this.calculatePeriodStats(trades);
    const patterns = this.analyzePeriodPatterns(trades);
    const recommendations = this.generatePeriodRecommendations(stats, patterns);
    
    return {
      period,
      tradeCount: trades.length,
      winRate: stats.winRate,
      avgRR: stats.avgRR,
      netPips: stats.netPips,
      bestStrategy: stats.bestStrategy,
      bestSession: stats.bestSession,
      bestPair: stats.bestPair,
      commonMistakes: patterns.commonMistakes,
      psychologicalWeaknesses: patterns.psychologicalWeaknesses,
      recommendations,
      executionTrend: stats.executionTrend,
      riskManagementGrade: stats.riskGrade
    };
  }
  
  /**
   * Calculate period statistics
   */
  calculatePeriodStats(trades) {
    const wins = trades.filter(t => t.outcome === 'Win');
    const losses = trades.filter(t => t.outcome === 'Loss');
    
    const winRate = trades.length > 0 ? (wins.length / trades.length * 100).toFixed(1) : 0;
    const avgRR = trades.reduce((sum, t) => sum + t.rrRatio, 0) / trades.length;
    const netPips = trades.reduce((sum, t) => sum + t.pips, 0);
    
    // Best performing strategy
    const strategyStats = {};
    trades.forEach(t => {
      if (!strategyStats[t.strategyName]) {
        strategyStats[t.strategyName] = { wins: 0, total: 0, pips: 0 };
      }
      strategyStats[t.strategyName].total++;
      strategyStats[t.strategyName].pips += t.pips;
      if (t.outcome === 'Win') strategyStats[t.strategyName].wins++;
    });
    
    let bestStrategy = 'N/A';
    let bestStrategyWinRate = 0;
    Object.entries(strategyStats).forEach(([name, stats]) => {
      const wr = (stats.wins / stats.total) * 100;
      if (wr > bestStrategyWinRate) {
        bestStrategyWinRate = wr;
        bestStrategy = `${name} (${wr.toFixed(0)}% WR)`;
      }
    });
    
    // Best session
    const sessionStats = {};
    trades.forEach(t => {
      if (!sessionStats[t.session]) sessionStats[t.session] = { wins: 0, total: 0 };
      sessionStats[t.session].total++;
      if (t.outcome === 'Win') sessionStats[t.session].wins++;
    });
    
    let bestSession = 'N/A';
    let bestSessionWinRate = 0;
    Object.entries(sessionStats).forEach(([name, stats]) => {
      const wr = (stats.wins / stats.total) * 100;
      if (wr > bestSessionWinRate) {
        bestSessionWinRate = wr;
        bestSession = `${name} (${wr.toFixed(0)}% WR)`;
      }
    });
    
    // Best pair
    const pairStats = {};
    trades.forEach(t => {
      if (!pairStats[t.currencyPair]) pairStats[t.currencyPair] = 0;
      pairStats[t.currencyPair] += t.pips;
    });
    
    let bestPair = 'N/A';
    let bestPairPips = -Infinity;
    Object.entries(pairStats).forEach(([pair, pips]) => {
      if (pips > bestPairPips) {
        bestPairPips = pips;
        bestPair = `${pair} (+${pips.toFixed(1)} pips)`;
      }
    });
    
    // Execution trend
    const avgScore = trades.reduce((sum, t) => 
      sum + (t.aiFeedback?.executionScore || 5), 0) / trades.length;
    
    const executionTrend = avgScore >= 7 ? 'Improving' : avgScore >= 5 ? 'Stable' : 'Needs attention';
    
    // Risk management grade
    const avgRisk = trades.reduce((sum, t) => sum + t.riskPercentage, 0) / trades.length;
    const riskGrade = avgRisk <= 1 ? 'A' : avgRisk <= 2 ? 'B' : avgRisk <= 3 ? 'C' : 'D';
    
    return {
      winRate,
      avgRR: avgRR.toFixed(2),
      netPips: netPips.toFixed(1),
      bestStrategy,
      bestSession,
      bestPair,
      executionTrend,
      riskGrade
    };
  }
  
  /**
   * Analyze period patterns
   */
  analyzePeriodPatterns(trades) {
    const mistakeCounts = {};
    const emotionalPatterns = {};
    
    trades.forEach(trade => {
      if (trade.aiFeedback) {
        // Count mistakes
        trade.aiFeedback.mistakes.forEach(mistake => {
          mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1;
        });
        
        // Count emotional states
        const emotion = trade.aiFeedback.emotionalState;
        emotionalPatterns[emotion] = (emotionalPatterns[emotion] || 0) + 1;
      }
    });
    
    // Top 3 common mistakes
    const commonMistakes = Object.entries(mistakeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mistake, count]) => `${mistake} (${count}x)`);
    
    // Psychological weaknesses
    const psychologicalWeaknesses = Object.entries(emotionalPatterns)
      .filter(([emotion]) => ['fearful', 'greedy', 'impulsive', 'revenge'].includes(emotion))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([emotion, count]) => `${emotion} trading (${count}x)`);
    
    return { commonMistakes, psychologicalWeaknesses };
  }
  
  /**
   * Generate period recommendations
   */
  generatePeriodRecommendations(stats, patterns) {
    const recommendations = [];
    
    // Win rate recommendations
    if (parseFloat(stats.winRate) < 40) {
      recommendations.push('Focus on quality over quantity. Review your entry criteria and wait for high-probability setups.');
    } else if (parseFloat(stats.winRate) > 60) {
      recommendations.push('Strong win rate! Ensure you\'re not exiting winners too early. Let profits run.');
    }
    
    // R:R recommendations
    if (parseFloat(stats.avgRR) < 1.5) {
      recommendations.push('Improve your R:R ratio by targeting at least 2:1 on all trades. Skip setups with poor risk-reward.');
    }
    
    // Risk management
    if (stats.riskGrade === 'C' || stats.riskGrade === 'D') {
      recommendations.push('⚠️ Reduce position sizing to 1-2% risk per trade. This is your #1 priority.');
    }
    
    // Common mistakes
    if (patterns.commonMistakes.length > 0) {
      recommendations.push(`Address your most common mistake: ${patterns.commonMistakes[0]}`);
    }
    
    // Psychological
    if (patterns.psychologicalWeaknesses.length > 0) {
      recommendations.push(`Work on emotional discipline. Detected: ${patterns.psychologicalWeaknesses[0]}`);
    }
    
    // General advice
    if (recommendations.length < 2) {
      recommendations.push('Continue building your trading journal. Consistency is key to improvement.');
    }
    
    return recommendations.slice(0, 3); // Max 3 recommendations
  }
  
  // ═══════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════
  
  hasNegativeEmotions(trade) {
    const emotions = [
      trade.emotionsBefore,
      trade.emotionsDuring,
      trade.emotionsAfter
    ].join(' ').toLowerCase();
    
    const negativeWords = ['fear', 'panic', 'revenge', 'angry', 'frustrated', 'anxious', 'stressed'];
    return negativeWords.some(word => emotions.includes(word));
  }
  
  hasRevengeEmotions(trade) {
    const emotions = [trade.emotionsAfter, trade.emotionsDuring].join(' ').toLowerCase();
    return emotions.includes('revenge') || emotions.includes('angry') || emotions.includes('frustrated');
  }
  
  hasFOMOIndicators(trade) {
    const allText = [
      trade.emotionsBefore,
      trade.notes
    ].join(' ').toLowerCase();
    
    return allText.includes('fomo') || 
           allText.includes('missing out') || 
           allText.includes('rushed') ||
           (trade.riskPercentage > 2 && allText.includes('impulsive'));
  }
  
  // ═══════════════════════════════════════════════════════════
  // 🔌 LLM INTEGRATION PLACEHOLDER METHODS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Future: LLM-powered trade analysis
   * Uncomment and implement when integrating with LLM API
   */
  /*
  async llmAnalyzeTrade(trade, userTrades) {
    const prompt = this.buildTradeAnalysisPrompt(trade, userTrades);
    
    // Example with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert forex trading coach analyzing trade execution quality."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
  
  buildTradeAnalysisPrompt(trade, userTrades) {
    return `Analyze this forex trade and provide structured feedback:
    
    Trade Details:
    - Pair: ${trade.currencyPair}
    - Direction: ${trade.direction}
    - Entry: ${trade.entryPrice}, SL: ${trade.stopLoss}, TP: ${trade.takeProfit}
    - R:R Ratio: ${trade.rrRatio}
    - Risk: ${trade.riskPercentage}%
    - Outcome: ${trade.outcome} (${trade.pips} pips)
    - Strategy: ${trade.strategyName}
    - Emotions Before: ${trade.emotionsBefore}
    - Emotions During: ${trade.emotionsDuring}
    - Notes: ${trade.notes}
    
    Recent Trading History:
    ${userTrades.slice(0, 5).map(t => 
      `${t.outcome} - ${t.currencyPair} - ${t.pips} pips`
    ).join('\n')}
    
    Provide JSON response with:
    {
      "executionScore": 1-10,
      "strengths": ["array", "of", "strengths"],
      "mistakes": ["array", "of", "mistakes"],
      "suggestion": "One actionable improvement",
      "patterns": ["detected_patterns"],
      "riskAssessment": "excellent|good|acceptable|poor|dangerous",
      "emotionalState": "calm|confident|fearful|greedy|impulsive|revenge|mixed"
    }`;
  }
  */
}

module.exports = new AIAnalysisService();
