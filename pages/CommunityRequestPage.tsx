import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { OctopusLogo } from '../constants';
import { recordInterest } from '../services/pointsDataService';

interface CommunityRequest {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  requesterAvatar: string;
  category: 'help' | 'skills' | 'items' | 'food' | 'other';
  status: 'open' | 'in-progress' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
  supporters: number;
  targetDate?: string;
  location: string;
  latitude: number;
  longitude: number;
  pointsReward: number;
  image?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

const MOCK_REQUESTS: CommunityRequest[] = [
  {
    id: '1',
    title: 'Help Me Move My Couch',
    description: 'Looking for 2-3 people to help move a couch up to a 2nd floor apartment. Should take about 30 minutes. Pizza and drinks provided!',
    requesterName: 'Sarah Johnson',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    category: 'help',
    status: 'open',
    urgency: 'high',
    createdAt: '2026-02-08',
    supporters: 3,
    targetDate: '2026-02-09',
    location: 'Birmingham, UK',
    latitude: 52.5086,
    longitude: -1.8853,
    pointsReward: 150,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop'
  },
  {
    id: '2',
    title: 'Extra Food - Come Get It!',
    description: 'Made too much curry and dessert! Have about 4 containers of homemade Indian food ready for pickup. First come, first served!',
    requesterName: 'Priya Patel',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'food',
    status: 'open',
    urgency: 'high',
    createdAt: '2026-02-08',
    supporters: 8,
    location: 'Solihull, UK',
    latitude: 52.4122,
    longitude: -1.7753,
    pointsReward: 75,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop'
  },
  {
    id: '3',
    title: 'Dog Walking Help',
    description: 'I walk dogs Monday-Friday mornings. If you need help walking your dog or know someone who does, I can help! Love all breeds.',
    requesterName: 'Marcus Chen',
    requesterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    category: 'skills',
    status: 'in-progress',
    urgency: 'low',
    createdAt: '2026-02-01',
    supporters: 5,
    location: 'Edgbaston, Birmingham',
    latitude: 52.5089,
    longitude: -1.9442,
    pointsReward: 100,
    image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&h=400&fit=crop'
  },
  {
    id: '4',
    title: 'Free Textbooks - Computer Science',
    description: 'Have 5 computer science textbooks from my degree. Free to anyone who wants them! Must collect from Harborne.',
    requesterName: 'James Wilson',
    requesterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    category: 'items',
    status: 'open',
    urgency: 'low',
    createdAt: '2026-02-05',
    supporters: 2,
    location: 'Harborne, Birmingham',
    latitude: 52.5056,
    longitude: -1.9897,
    pointsReward: 80,
    image: 'https://images.unsplash.com/photo-1507842675022-8ee975bfa26f?w=600&h=400&fit=crop'
  },
  {
    id: '5',
    title: 'IKEA Furniture Assembly Help',
    description: 'Moving in this weekend. Have about 5 pieces of IKEA furniture to assemble. Could use 1-2 extra hands. Tools available.',
    requesterName: 'Elena Rodriguez',
    requesterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    category: 'help',
    status: 'open',
    urgency: 'medium',
    createdAt: '2026-02-06',
    supporters: 4,
    targetDate: '2026-02-10',
    location: 'Kings Heath, Birmingham',
    latitude: 52.4678,
    longitude: -1.8506,
    pointsReward: 120,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop'
  },
  {
    id: '6',
    title: 'Homemade Baked Goods - Saturday Pickup',
    description: 'Baked cookies, brownies, and bread on Saturday. Have extras! £2-3 per item or trade for other homemade goods.',
    requesterName: 'Lisa Thompson',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    category: 'food',
    status: 'open',
    urgency: 'medium',
    createdAt: '2026-02-07',
    supporters: 12,
    location: 'Selly Oak, Birmingham',
    latitude: 52.4539,
    longitude: -1.9303,
    pointsReward: 50
  },
  {
    id: '7',
    title: 'Need Help with Groceries',
    description: 'Elderly neighbor needs help carrying groceries from car to apartment (3rd floor, no lift). Weekly help would be amazing!',
    requesterName: 'Tom Anderson',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'help',
    status: 'open',
    urgency: 'medium',
    createdAt: '2026-02-07',
    supporters: 6,
    location: 'Moseley, Birmingham',
    latitude: 52.4500,
    longitude: -1.8753,
    pointsReward: 90,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'
  },
  {
    id: '8',
    title: 'Free Baby Clothes & Toys',
    description: 'My kids have outgrown tons of clothes (ages 0-3) and toys. All in great condition! Free to families who need them.',
    requesterName: 'Rachel Green',
    requesterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    category: 'items',
    status: 'open',
    urgency: 'low',
    createdAt: '2026-02-06',
    supporters: 15,
    location: 'Sutton Coldfield, Birmingham',
    latitude: 52.5608,
    longitude: -1.8247,
    pointsReward: 60,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop'
  },
  {
    id: '9',
    title: 'Guitar Lessons - Pay What You Can',
    description: 'Been playing guitar for 15 years. Offering lessons for beginners. Pay what you can afford, or we can barter services!',
    requesterName: 'David Wright',
    requesterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    category: 'skills',
    status: 'open',
    urgency: 'low',
    createdAt: '2026-02-05',
    supporters: 9,
    location: 'Bournville, Birmingham',
    latitude: 52.4272,
    longitude: -1.9311,
    pointsReward: 110,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop'
  },
  {
    id: '10',
    title: 'Community Garden Help Needed',
    description: 'Starting a community garden this spring! Need help with setup, planting, and maintenance. All skills welcome!',
    requesterName: 'Maya Sharma',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    category: 'other',
    status: 'open',
    urgency: 'medium',
    createdAt: '2026-02-07',
    supporters: 18,
    targetDate: '2026-03-01',
    location: 'Stirchley, Birmingham',
    latitude: 52.4394,
    longitude: -1.9183,
    pointsReward: 140,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop'
  },
  {
    id: '11',
    title: 'Car Share to London - This Weekend',
    description: 'Driving to London on Saturday morning, returning Sunday evening. Have 3 seats available. Split petrol costs!',
    requesterName: 'Oliver Brown',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'other',
    status: 'open',
    urgency: 'high',
    createdAt: '2026-02-08',
    supporters: 4,
    targetDate: '2026-02-13',
    location: 'City Centre, Birmingham',
    latitude: 52.4862,
    longitude: -1.8904,
    pointsReward: 100,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop'
  },
  {
    id: '12',
    title: 'Tech Help for Seniors',
    description: 'Offering free tech support for seniors! Help with smartphones, tablets, computers, video calls. Patient and friendly.',
    requesterName: 'Aisha Khan',
    requesterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    category: 'skills',
    status: 'in-progress',
    urgency: 'low',
    createdAt: '2026-02-03',
    supporters: 7,
    location: 'Erdington, Birmingham',
    latitude: 52.5261,
    longitude: -1.8369,
    pointsReward: 130,
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop'
  },
  {
    id: '13',
    title: 'Leftover Party Food!',
    description: 'Had a party last night with way too much food! Sandwiches, snacks, desserts all packaged. Pick up today!',
    requesterName: 'Sophie Miller',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    category: 'food',
    status: 'open',
    urgency: 'high',
    createdAt: '2026-02-08',
    supporters: 11,
    location: 'Harborne, Birmingham',
    latitude: 52.4589,
    longitude: -1.9653,
    pointsReward: 70,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'
  },
  {
    id: '14',
    title: 'Study Buddy Needed - Medical Student',
    description: 'Looking for another medical student or healthcare professional to study with. Can meet at library or cafes.',
    requesterName: 'Ben Clarke',
    requesterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    category: 'skills',
    status: 'open',
    urgency: 'low',
    createdAt: '2026-02-06',
    supporters: 3,
    location: 'Edgbaston, Birmingham',
    latitude: 52.4564,
    longitude: -1.9247,
    pointsReward: 95,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop'
  },
  {
    id: '15',
    title: 'Bike Repair Workshop - Free!',
    description: 'Hosting a free bike repair workshop this Saturday. Bring your bike, learn basic maintenance. Tools and refreshments provided!',
    requesterName: 'Chris Taylor',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'skills',
    status: 'open',
    urgency: 'medium',
    createdAt: '2026-02-07',
    supporters: 14,
    targetDate: '2026-02-13',
    location: 'Digbeth, Birmingham',
    latitude: 52.4753,
    longitude: -1.8864,
    pointsReward: 125,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop'
  },
  {
    id: '16',
    title: 'Need Help Painting Fence',
    description: 'Long garden fence needs painting. Should take 2-3 hours with 2 people. All supplies provided, lunch included!',
    requesterName: 'Hannah Davis',
    requesterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    category: 'help',
    status: 'open',
    urgency: 'medium',
    createdAt: '2026-02-07',
    supporters: 5,
    targetDate: '2026-02-14',
    location: 'Northfield, Birmingham',
    latitude: 52.4111,
    longitude: -1.9611,
    pointsReward: 135,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop'
  },
  {
    id: '17',
    title: 'Free Houseplants - Too Many!',
    description: 'My plants had babies! Giving away spider plants, pothos, and succulents. Perfect for beginners. Bring your own pots!',
    requesterName: 'Zoe Williams',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    category: 'items',
    status: 'open',
    urgency: 'low',
    createdAt: '2026-02-05',
    supporters: 20,
    location: 'Moseley, Birmingham',
    latitude: 52.4483,
    longitude: -1.8736,
    pointsReward: 55,
    image: 'https://images.unsplash.com/photo-1463620695885-8a91d87c53d0?w=600&h=400&fit=crop'
  },
  {
    id: '18',
    title: 'Language Exchange - Spanish/English',
    description: 'Native Spanish speaker looking to practice English. Happy to teach Spanish in return! Coffee meetups or video calls.',
    requesterName: 'Carlos Rodriguez',
    requesterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    category: 'skills',
    status: 'open',
    urgency: 'low',
    createdAt: '2026-02-04',
    supporters: 8,
    location: 'City Centre, Birmingham',
    latitude: 52.4814,
    longitude: -1.8964,
    pointsReward: 105,
    image: 'https://images.unsplash.com/photo-1523540939399-141cbff6a8d7?w=600&h=400&fit=crop'
  },
  {
    id: '19',
    title: 'Spring Cleaning Help Needed',
    description: 'Doing a big spring clean this weekend! Need help moving furniture, sorting items. Pizza, drinks, and good vibes!',
    requesterName: 'Amy Foster',
    requesterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    category: 'help',
    status: 'open',
    urgency: 'medium',
    createdAt: '2026-02-08',
    supporters: 6,
    targetDate: '2026-02-13',
    location: 'Selly Park, Birmingham',
    latitude: 52.4456,
    longitude: -1.9236,
    pointsReward: 115,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop'
  },
  {
    id: '20',
    title: 'Meal Prep Group - Join Us!',
    description: 'Starting a Sunday meal prep group. Batch cook healthy meals together, share recipes, save money! Beginners welcome.',
    requesterName: 'Nina Patel',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    category: 'food',
    status: 'open',
    urgency: 'low',
    createdAt: '2026-02-06',
    supporters: 16,
    location: 'Kings Heath, Birmingham',
    latitude: 52.4339,
    longitude: -1.8828,
    pointsReward: 85,
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=400&fit=crop'
  }
];

const CommunityRequestPage: React.FC<{ userLocation?: UserLocation }> = ({ userLocation = { latitude: 52.5086, longitude: -1.8853 } }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [proximityFilter, setProximityFilter] = useState<number | null>(2); // 2 miles
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'help',
    urgency: 'medium',
    location: '',
    targetDate: '',
    pointsReward: 100
  });
  const [requests, setRequests] = useState<CommunityRequest[]>(MOCK_REQUESTS);
  const [claimedRequests, setClaimedRequests] = useState<Set<string>>(
    () => new Set<string>()
  );
  const [pointsEarnedMessage, setPointsEarnedMessage] = useState<{ points: number; requestId: string } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Load requests from backend on mount
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/requests');
        if (response.ok) {
          const backendRequests = await response.json();
          // Merge backend requests with mock data (backend requests first)
          setRequests([...backendRequests, ...MOCK_REQUESTS]);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        // Keep using mock data if backend fails
      }
    };
    
    loadRequests();
  }, []);

  // Calculate distance in miles between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleInterestedClick = async (request: CommunityRequest) => {
    // Prevent double-earning points for the same request
    if (claimedRequests.has(request.id)) {
      return;
    }

    try {
      const userId = 'current-user';

      // Record interest - single source of truth
      const success = await recordInterest(
        userId,
        request.id,
        request.title,
        request.pointsReward,
        request.category,
        request.urgency,
        request.location
      );

      if (success) {
        // Clear existing timeout to prevent memory leak
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
        }

        // Show points earned notification
        setPointsEarnedMessage({ 
          points: request.pointsReward, 
          requestId: request.id 
        });

        // Hide after 3 seconds with cleanup
        notificationTimeoutRef.current = setTimeout(() => {
          setPointsEarnedMessage(null);
          notificationTimeoutRef.current = null;
        }, 3000);

        // Update UI optimistically
        setRequests(prev =>
          prev.map(r =>
            r.id === request.id ? { ...r, supporters: r.supporters + 1 } : r
          )
        );

        // Mark as claimed
        setClaimedRequests(prev => new Set(prev).add(request.id));
      }
    } catch (error) {
      console.error('Error recording interest:', error);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      const matchesSearch = searchTerm === '' ||
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        request.latitude,
        request.longitude
      );
      const matchesProximity = proximityFilter === null || distance <= proximityFilter;

      return matchesCategory && matchesStatus && matchesSearch && matchesProximity;
    }).sort((a, b) => {
      // Sort by distance
      const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
      const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  }, [selectedCategory, selectedStatus, searchTerm, proximityFilter, userLocation, requests]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create request data
      const newRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        urgency: formData.urgency,
        location: formData.location,
        targetDate: formData.targetDate,
        pointsReward: formData.pointsReward,
        // Add approximate coordinates based on Birmingham, UK
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.1,
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.1,
      };
      
      // Send to backend
      const response = await fetch('http://localhost:3001/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRequest),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Request created successfully:', result);
        
        // Add the new request to local state for immediate display
        setRequests(prev => [result.request, ...prev]);
        
        // Show success message (without points)
        alert('Request created successfully! Others can now help.');
      } else {
        alert('Failed to create request. Please try again.');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request. Please try again.');
    }
    
    // Clear form and close modal
    setFormData({ title: '', description: '', category: 'help', urgency: 'medium', location: '', targetDate: '', pointsReward: 100 });
    setIsCreatingRequest(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === 'pointsReward' ? parseInt(value) : value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700/30 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-12">
      {/* Points Earned Notification - Enhanced */}
      {pointsEarnedMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-2xl shadow-2xl border-4 border-green-400/50 animate-in slide-in-from-right duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-black text-2xl mb-1">+{pointsEarnedMessage.points} Points! 🎉</p>
              <p className="text-sm text-white/90 font-medium">Successfully recorded your interest</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  ✓ Saved to your profile
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  ✓ Leaderboard updated
                </div>
              </div>
            </div>
            <button 
              onClick={() => setPointsEarnedMessage(null)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand via-brand-dark to-brand/80 text-white p-12 lg:p-20 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <OctopusLogo className="w-96 h-96 transform translate-x-1/4 -translate-y-1/4" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
            Community <br />Requests
          </h1>
          <p className="text-xl text-white/90 mb-10 font-medium">
            Need help moving a couch? Have extra food? Help your neighbors and earn points! Browse requests near you.
          </p>
          <button 
            onClick={() => setIsCreatingRequest(true)}
            className="bg-white text-brand px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-50 transition-all hover:scale-105"
          >
            + Create a Request
          </button>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="space-y-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search requests... (couch, food, help...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-brand focus:border-transparent text-lg font-medium"
          />
          <svg className="absolute right-6 top-4 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-brand"
          >
            <option value="all">All Categories</option>
            <option value="help">Help (Moving, Assembly)</option>
            <option value="food">Food (Cooking, Baking)</option>
            <option value="items">Items (Free Stuff)</option>
            <option value="skills">Skills (Services)</option>
            <option value="other">Other</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-brand"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={proximityFilter === null ? 'unlimited' : proximityFilter}
            onChange={(e) => setProximityFilter(e.target.value === 'unlimited' ? null : parseInt(e.target.value))}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-brand"
          >
            <option value="1">Within 1 Mile</option>
            <option value="2">Within 2 Miles ✓</option>
            <option value="5">Within 5 Miles</option>
            <option value="10">Within 10 Miles</option>
            <option value="unlimited">Unlimited Distance</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            {filteredRequests.length} Request{filteredRequests.length !== 1 ? 's' : ''} Near You
          </h2>
        </div>

        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredRequests.map(request => {
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                request.latitude,
                request.longitude
              ).toFixed(1);

              return (
                <div key={request.id} className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-300">
                  {/* Image section */}
                  {request.image && (
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600">
                      <img src={request.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={request.title} />
                    </div>
                  )}

                  {/* Header with Status */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-700/50 dark:to-transparent">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-xl font-bold group-hover:text-brand transition-colors flex-1">{request.title}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </div>
                    </div>

                    {/* Requester Info */}
                    <div className="flex items-center gap-3">
                      <img src={request.requesterAvatar} className="w-10 h-10 rounded-full" alt={request.requesterName} />
                      <div>
                        <p className="font-bold text-sm">{request.requesterName}</p>
                        <p className="text-xs text-slate-500">Posted {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{request.description}</p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <svg className="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{distance} mi</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{request.location.split(',')[0]}</p>
                      </div>
                      <div className="text-center border-l border-r border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-lg font-bold text-yellow-500">⭐</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{request.pointsReward}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Points</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <svg className="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v-6a1.5 1.5 0 01-3 0v6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{request.supporters}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Interested</p>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div>
                      <span className="inline-block bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-bold capitalize">
                        {request.category === 'help' && '🙋 Help Needed'}
                        {request.category === 'food' && '🍽️ Food'}
                        {request.category === 'items' && '📦 Free Items'}
                        {request.category === 'skills' && '🎓 Skills'}
                        {request.category === 'other' && '✨ Other'}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/20 border-t border-slate-100 dark:border-slate-700">
                    <button
                      className="w-full py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all duration-200 hover:scale-105"
                      onClick={() => handleInterestedClick(request)}
                    >
                      Interested - Earn {request.pointsReward} Points
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <OctopusLogo className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className="text-xl text-slate-400 font-medium">No requests found in your area. Try expanding your search radius!</p>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {isCreatingRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Create a Request</h2>
                <button
                  onClick={() => setIsCreatingRequest(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Request Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Help me move my couch, Extra food - come get it!"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Tell us more about your request..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-brand focus:border-transparent"
                    >
                      <option value="help">Help (Moving, Assembly)</option>
                      <option value="food">Food (Cooking, Baking)</option>
                      <option value="items">Items (Free Stuff)</option>
                      <option value="skills">Skills (Services)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Urgency</label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-brand focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      placeholder="e.g., Solihull, Birmingham"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-brand focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Date</label>
                    <input
                      type="date"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-brand focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Points Reward ⭐</label>
                  <input
                    type="number"
                    name="pointsReward"
                    value={formData.pointsReward}
                    onChange={handleFormChange}
                    min="50"
                    max="500"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-brand focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Higher points attract more helpers!</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all duration-200"
                  >
                    Create Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingRequest(false)}
                    className="flex-1 py-4 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityRequestPage;