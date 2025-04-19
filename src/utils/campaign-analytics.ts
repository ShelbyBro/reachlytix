
export const generateMockAnalytics = (startDate: Date, endDate: Date, messageType: string = 'email') => {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dataPoints = Math.min(days, 30); // Cap at 30 data points to avoid overcrowding
  
  const emailsOverTime = [];
  let totalSent = 0;
  let totalDelivered = 0;
  let totalOpened = 0;
  let totalClicked = 0;
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(i * days / dataPoints));
    
    const sentCount = Math.floor(Math.random() * 50) + 10;
    const deliveredCount = Math.floor(sentCount * (0.9 + Math.random() * 0.1));
    const openedCount = Math.floor(deliveredCount * (0.3 + Math.random() * 0.4));
    const clickedCount = Math.floor(openedCount * (0.1 + Math.random() * 0.3));
    
    emailsOverTime.push({
      date: date.toISOString().split('T')[0],
      sent: sentCount,
      delivered: deliveredCount,
      opened: openedCount,
      clicked: clickedCount,
      type: messageType
    });
    
    totalSent += sentCount;
    totalDelivered += deliveredCount;
    totalOpened += openedCount;
    totalClicked += clickedCount;
  }
  
  return {
    overTime: emailsOverTime,
    totals: {
      sent: totalSent,
      delivered: totalDelivered,
      failed: totalSent - totalDelivered,
      opened: totalOpened,
      clicked: totalClicked,
      openRate: totalOpened / totalDelivered,
      clickRate: totalClicked / totalDelivered,
      conversionRate: totalClicked * 0.15 / totalDelivered, // Assuming 15% of clicks convert
    }
  };
};
