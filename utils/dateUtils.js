const getNextPaymentDate = (currentDate, frequency) => {
  const date = new Date(currentDate);

  switch (frequency) {
    case 1: // Monthly
      date.setMonth(date.getMonth() + 1);
      break;

    case 2: // Weekly
      date.setDate(date.getDate() + 7);
      break;

    case 3: // Daily
      date.setDate(date.getDate() + 1);
      break;

    default:
      throw new Error("Invalid frequency");
  }

  return date;
};

module.exports = { getNextPaymentDate };
