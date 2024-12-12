const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flightName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  availabilityDates: {
    type: [Date], // Array of available dates
    required: true,
  },
  ticketOptions: [
    {
      classType: {
        type: String, // e.g., Economy, Business, First Class
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      facilities: {
        type: [String], // e.g., ["WiFi", "Meals", "Extra Legroom"]
        default: [],
      },
    },
  ],
  duration: {
    type: String, // e.g., "2h 30m"
    required: true,
  },
  baggageAllowance: {
    type: String, // e.g., "20kg"
    required: true,
  },
});

const Flight = mongoose.model("Flight", flightSchema);

module.exports = Flight;
