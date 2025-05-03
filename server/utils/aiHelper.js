const parseWorkBreakdown = (workBreakdown) => { // Helper function to parse days from work breakdown
  return workBreakdown.map(task => {
    // Convert string durations like "2 weeks" to days
    if (typeof task.duration === 'string') {
      if (task.duration.includes('week')) {
        task.duration = parseInt(task.duration) * 7;
      } else if (task.duration.includes('day')) {
        task.duration = parseInt(task.duration);
      }
    }
    return task;
  });
};


const cleanDeliverables = (deliverables) => { // Helper function to clean the count (quantity) field in deliverables. Change string to some definative number
  return deliverables.map(item => {
    // Convert string counts to numbers or set default
    if (item.count && typeof item.count === 'string') {
      if (item.count.toLowerCase() === 'multiple') {
        item.count = 1; // Default value
      } else {
        // Extract first number found in string
        const numMatch = item.count.match(/\d+/);
        item.count = numMatch ? parseInt(numMatch[0]) : 1;
      }
    }
    return item;
  });
};

module.exports = { parseWorkBreakdown, cleanDeliverables };