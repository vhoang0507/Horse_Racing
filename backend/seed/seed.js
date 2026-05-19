require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Horse = require('../models/Horse');
const Tournament = require('../models/Tournament');
const Race = require('../models/Race');
const RaceResult = require('../models/RaceResult');
const Bet = require('../models/Bet');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/horse_racing';

const horseNames = ['Thunder Bolt', 'Golden Spirit', 'Shadow Dancer', 'Iron Will', 'Silver Arrow',
  'Desert Storm', 'Fire Blaze', 'Ocean Wave', 'Night Rider', 'Star Chaser',
  'Wild Fury', 'Royal Crown', 'Wind Runner', 'Dark Knight', 'Crystal Dream'];

const breeds = ['Thoroughbred', 'Arabian', 'Quarter Horse', 'Standardbred', 'Appaloosa'];
const colors = ['Bay', 'Chestnut', 'Black', 'Gray', 'Roan', 'Palomino'];
const locations = ['Hanoi Racecourse', 'Ho Chi Minh Racetrack', 'Da Nang Speed Arena', 'Nha Trang Circuit', 'Hai Phong Track'];
const trackTypes = ['dirt', 'turf', 'synthetic'];
const weathers = ['clear', 'cloudy', 'windy', 'light rain'];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear all
  await Promise.all([
    User.deleteMany(), Horse.deleteMany(), Tournament.deleteMany(),
    Race.deleteMany(), RaceResult.deleteMany(), Bet.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'System Admin', email: 'admin@horseracing.com',
    password: 'admin123', role: 'admin',
  });

  // Create horse owners
  const owners = await Promise.all([
    { name: 'Nguyen Van An', email: 'owner1@test.com', password: 'password123', role: 'horse_owner', points: 1200, phone: '0901234567' },
    { name: 'Tran Thi Bich', email: 'owner2@test.com', password: 'password123', role: 'horse_owner', points: 980, phone: '0912345678' },
    { name: 'Le Van Cuong', email: 'owner3@test.com', password: 'password123', role: 'horse_owner', points: 1500, phone: '0923456789' },
  ].map(u => User.create(u)));

  // Create jockeys
  const jockeys = await Promise.all([
    { name: 'Pham Minh Duc', email: 'jockey1@test.com', password: 'password123', role: 'jockey', points: 2100, bio: 'Professional jockey with 8 years experience' },
    { name: 'Hoang Thi Em', email: 'jockey2@test.com', password: 'password123', role: 'jockey', points: 1750, bio: 'National champion 2023' },
    { name: 'Vu Quoc Phong', email: 'jockey3@test.com', password: 'password123', role: 'jockey', points: 1400, bio: 'Specializes in long-distance races' },
    { name: 'Do Thanh Giang', email: 'jockey4@test.com', password: 'password123', role: 'jockey', points: 900, bio: 'Rising star in the racing world' },
  ].map(u => User.create(u)));

  // Create referees
  const referees = await Promise.all([
    { name: 'Bui Huu Hanh', email: 'referee1@test.com', password: 'password123', role: 'referee' },
    { name: 'Nguyen Thi Lan', email: 'referee2@test.com', password: 'password123', role: 'referee' },
  ].map(u => User.create(u)));

  // Create spectators
  const spectators = await Promise.all([
    { name: 'Cao Van Minh', email: 'spectator1@test.com', password: 'password123', role: 'spectator', points: 450 },
    { name: 'Dinh Thi Nhu', email: 'spectator2@test.com', password: 'password123', role: 'spectator', points: 820 },
    { name: 'Ly Van Oanh', email: 'spectator3@test.com', password: 'password123', role: 'spectator', points: 300 },
  ].map(u => User.create(u)));

  console.log('👥 Users created');

  // Create horses
  const horseData = horseNames.map((name, i) => ({
    name,
    breed: breeds[i % breeds.length],
    age: 3 + (i % 7),
    color: colors[i % colors.length],
    weight: 450 + (i * 5),
    height: 155 + (i * 2),
    owner: owners[i % owners.length]._id,
    jockey: jockeys[i % jockeys.length]._id,
    status: i % 8 === 0 ? 'injured' : 'available',
    wins: Math.floor(Math.random() * 15),
    losses: Math.floor(Math.random() * 10),
    totalRaces: Math.floor(Math.random() * 25) + 5,
    isVerified: i % 3 !== 0,
    description: `${name} is a ${breeds[i % breeds.length]} known for extraordinary speed and endurance.`,
  }));
  const horses = await Horse.insertMany(horseData);
  console.log('🐴 Horses created');

  // Create tournaments
  const now = new Date();
  const tournaments = await Tournament.insertMany([
    {
      name: 'Vietnam Grand Prix 2025',
      description: 'The most prestigious horse racing tournament in Southeast Asia',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 30),
      location: locations[0],
      status: 'completed',
      prizePool: 500000000,
      maxHorses: 20,
      createdBy: admin._id,
    },
    {
      name: 'Spring Cup Championship',
      description: 'Annual spring racing festival celebrating the best thoroughbreds',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), 28),
      location: locations[1],
      status: 'ongoing',
      prizePool: 350000000,
      maxHorses: 16,
      createdBy: admin._id,
    },
    {
      name: 'Summer Classic 2025',
      description: 'The ultimate test of speed and stamina under summer heat',
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 31),
      location: locations[2],
      status: 'upcoming',
      prizePool: 600000000,
      maxHorses: 24,
      createdBy: admin._id,
    },
  ]);
  console.log('🏆 Tournaments created');

  // Create races
  const makeParticipants = (count) =>
    Array.from({ length: count }, (_, i) => ({
      horse: horses[i % horses.length]._id,
      jockey: jockeys[i % jockeys.length]._id,
      laneNumber: i + 1,
    }));

  const races = await Race.insertMany([
    {
      name: 'Sprint Qualifier - Round 1', tournament: tournaments[0]._id,
      raceDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      trackLength: 1200, trackType: 'turf', status: 'completed',
      referee: referees[0]._id, maxParticipants: 8,
      participants: makeParticipants(8), weather: 'clear',
    },
    {
      name: 'Grand Prix Finals', tournament: tournaments[0]._id,
      raceDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      trackLength: 2400, trackType: 'turf', status: 'completed',
      referee: referees[1]._id, maxParticipants: 12,
      participants: makeParticipants(12), weather: 'cloudy',
    },
    {
      name: 'Spring Cup Heat 1', tournament: tournaments[1]._id,
      raceDate: new Date(now.getFullYear(), now.getMonth(), 5),
      trackLength: 1600, trackType: 'dirt', status: 'completed',
      referee: referees[0]._id, maxParticipants: 10,
      participants: makeParticipants(10), weather: 'clear',
    },
    {
      name: 'Spring Cup Heat 2', tournament: tournaments[1]._id,
      raceDate: new Date(now.getFullYear(), now.getMonth(), 12),
      trackLength: 1800, trackType: 'synthetic', status: 'in_progress',
      referee: referees[1]._id, maxParticipants: 10,
      participants: makeParticipants(10), weather: 'windy',
    },
    {
      name: 'Spring Cup Semi-Final', tournament: tournaments[1]._id,
      raceDate: new Date(now.getFullYear(), now.getMonth(), 20),
      trackLength: 2000, trackType: 'turf', status: 'scheduled',
      referee: referees[0]._id, maxParticipants: 8,
      participants: makeParticipants(8), weather: 'clear',
    },
    {
      name: 'Summer Classic Qualifier', tournament: tournaments[2]._id,
      raceDate: new Date(now.getFullYear(), now.getMonth() + 2, 8),
      trackLength: 1400, trackType: 'dirt', status: 'scheduled',
      referee: referees[1]._id, maxParticipants: 12,
      participants: makeParticipants(6), weather: 'clear',
    },
  ]);
  console.log('🏇 Races created');

  // Create results for completed races
  const times = [72.3, 74.1, 75.5, 76.2, 77.0, 78.8, 79.3, 80.1];
  await RaceResult.insertMany([
    {
      race: races[0]._id,
      rankings: races[0].participants.slice(0, 8).map((p, i) => ({
        position: i + 1, horse: p.horse, jockey: p.jockey,
        finishTime: times[i] + Math.random() * 2,
        prize: i === 0 ? 50000000 : i === 1 ? 30000000 : i === 2 ? 20000000 : 0,
      })),
      confirmedBy: referees[0]._id, confirmedAt: new Date(),
    },
    {
      race: races[1]._id,
      rankings: races[1].participants.slice(0, 12).map((p, i) => ({
        position: i + 1, horse: p.horse, jockey: p.jockey,
        finishTime: 144 + i * 1.5 + Math.random() * 2,
        prize: i === 0 ? 250000000 : i === 1 ? 150000000 : i === 2 ? 100000000 : 0,
      })),
      confirmedBy: referees[1]._id, confirmedAt: new Date(),
    },
    {
      race: races[2]._id,
      rankings: races[2].participants.slice(0, 10).map((p, i) => ({
        position: i + 1, horse: p.horse, jockey: p.jockey,
        finishTime: 95 + i * 1.2 + Math.random() * 2,
        prize: i === 0 ? 87500000 : i === 1 ? 52500000 : i === 2 ? 35000000 : 0,
      })),
      confirmedBy: referees[0]._id, confirmedAt: new Date(),
    },
  ]);
  console.log('🏅 Results created');

  // Create bets
  await Bet.insertMany([
    { user: spectators[0]._id, race: races[0]._id, predictedHorse: horses[0]._id, predictedPosition: 1, amount: 500000, odds: 2.5, status: 'won', payout: 1250000 },
    { user: spectators[1]._id, race: races[0]._id, predictedHorse: horses[1]._id, predictedPosition: 1, amount: 300000, odds: 3.0, status: 'lost', payout: 0 },
    { user: spectators[2]._id, race: races[1]._id, predictedHorse: horses[2]._id, predictedPosition: 1, amount: 1000000, odds: 2.0, status: 'won', payout: 2000000 },
    { user: spectators[0]._id, race: races[3]._id, predictedHorse: horses[3]._id, predictedPosition: 1, amount: 750000, odds: 1.8, status: 'pending', payout: 0 },
    { user: spectators[1]._id, race: races[4]._id, predictedHorse: horses[4]._id, predictedPosition: 2, amount: 500000, odds: 4.0, status: 'pending', payout: 0 },
  ]);
  console.log('💰 Bets created');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 LOGIN CREDENTIALS:');
  console.log('  Admin:      admin@horseracing.com  / admin123');
  console.log('  Owner:      owner1@test.com        / password123');
  console.log('  Jockey:     jockey1@test.com       / password123');
  console.log('  Referee:    referee1@test.com      / password123');
  console.log('  Spectator:  spectator1@test.com    / password123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
