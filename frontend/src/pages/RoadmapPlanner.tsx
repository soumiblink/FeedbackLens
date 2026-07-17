import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Plus, Edit2, Trash2, X, AlertCircle, Calendar, User, Target, Tag } from 'lucide-react';
import { getRoadmap, createRoadmapItem, updateRoadmapItem, deleteRoadmapItem } from '../services/api';
import { useLocation } from 'react-router-dom';

interface RoadmapItem {
  id: number;
  topic: string;
  priority_score: number;
  priority_level: string;
  release_name: string;
  quarter: string;
  status: string;
  owner: string | null;
  business_goal: string | null;
  created_at: string;
  updated_at: string;
}

interface RoadmapFormData {
  topic: string;
  priority_score: number;
  priority_level: string;
  release_name: string;
  quarter: string;
  status: string;
  owner: string;
  business_goal: string;
}

export default function RoadmapPlanner() {
  const location = useLocation();
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<RoadmapFormData>({
    topic: '',
    priority_score: 5.0,
    priority_level: 'medium',
    release_name: '',
    quarter: '',
    status: 'Backlog',
    owner: '',
    business_goal: ''
  });

  useEffect(() => {
    loadRoadmap();
    
    // Check if we have pre-filled data from navigation
    if (location.state) {
      const { topic, priority_score, priority_level } = location.state as any;
      if (topic) {
        setFormData({
          topic: topic || '',
          priority_score: priority_score || 5.0,
          priority_level: priority_level || 'medium',
          release_name: '',
          quarter: '',
          status: 'Backlog',
          owner: '',
          business_goal: ''
        });
        setShowModal(true);
      }
    }
  }, [location]);

  const loadRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoadmap();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: RoadmapItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        topic: item.topic,
        priority_score: item.priority_score,
        priority_level: item.priority_level,
        release_name: item.release_name,
        quarter: item.quarter,
        status: item.status,
        owner: item.owner || '',
        business_goal: item.business_goal || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        topic: '',
        priority_score: 5.0,
        priority_level: 'medium',
        release_name: '',
        quarter: '',
        status: 'Backlog',
        owner: '',
        business_goal: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingItem) {
        // Update existing item
        await updateRoadmapItem(editingItem.id, {
          status: formData.status,
          owner: formData.owner || undefined,
          release_name: formData.release_name,
          quarter: formData.quarter,
          business_goal: formData.business_goal || undefined
        });
      } else {
        // Create new item
        await createRoadmapItem({
          topic: formData.topic,
          priority_score: formData.priority_score,
          priority_level: formData.priority_level,
          release_name: formData.release_name,
          quarter: formData.quarter,
          status: formData.status,
          owner: formData.owner || undefined,
          business_goal: formData.business_goal || undefined
        });
      }
      
      handleCloseModal();
      loadRoadmap();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save roadmap item');
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;

    try {
      await deleteRoadmapItem(itemToDelete);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      loadRoadmap();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to delete roadmap item');
    }
  };

  const openDeleteConfirm = (id: number) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTopic = (topic: string): string => {
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPriorityLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Group items by status
  const itemsByStatus = {
    'Backlog': items.filter(item => item.status === 'Backlog'),
    'Planned': items.filter(item => item.status === 'Planned'),
    'In Progress': items.filter(item => item.status === 'In Progress'),
    'Released': items.filter(item => item.status === 'Released')
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Roadmap Planner</h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Roadmap Item
          </button>
        </div>
        <p className="text-muted-text">Convert validated opportunities into actionable product plans.</p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Backlog', value: itemsByStatus.Backlog.length, color: 'text-slate-400' },
          { label: 'Planned', value: itemsByStatus.Planned.length, color: 'text-cyan-400' },
          { label: 'In Progress', value: itemsByStatus['In Progress'].length, color: 'text-indigo-400' },
          { label: 'Released', value: itemsByStatus.Released.length, color: 'text-emerald-400' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-panel p-4"
          >
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Roadmap Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(itemsByStatus).map(([status, statusItems]) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <h3 className="font-bold text-white">{status}</h3>
              <span className="text-sm text-slate-500">({statusItems.length})</span>
            </div>
            
            <div className="space-y-3">
              {statusItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-panel p-4 hover:bg-dark-surface/90 transition-colors"
                >
                  {/* Topic */}
                  <h4 className="text-lg font-bold text-white mb-3">{formatTopic(item.topic)}</h4>

                  {/* Priority Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border uppercase ${getPriorityLevelColor(item.priority_level)}`}>
                      {item.priority_level}
                    </span>
                    <span className="text-sm text-slate-400">
                      {item.priority_score.toFixed(1)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Tag className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">{item.release_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{item.quarter}</span>
                    </div>
                    {item.owner && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>{item.owner}</span>
                      </div>
                    )}
                    {item.business_goal && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <Target className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{item.business_goal}</span>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-slate-500 mb-3">
                    Created: {formatDate(item.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(item.id)}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {statusItems.length === 0 && (
                <div className="glass-panel p-6 text-center">
                  <p className="text-sm text-slate-500 italic">No items</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center"
        >
          <Map className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No Roadmap Items Yet</h3>
          <p className="text-slate-500 mb-4">
            Start planning by adding opportunities to your product roadmap.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Your First Item
          </button>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Edit Roadmap Item' : 'Add Roadmap Item'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Topic <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    disabled={!!editingItem}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Priority Score (only for new items) */}
                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Priority Score
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.priority_score}
                      onChange={(e) => setFormData({ ...formData, priority_score: parseFloat(e.target.value) })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {/* Priority Level (only for new items) */}
                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Priority Level <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.priority_level}
                      onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                )}

                {/* Release Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Release Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.release_name}
                    onChange={(e) => setFormData({ ...formData, release_name: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., v2.0, Spring Release"
                    required
                  />
                </div>

                {/* Quarter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quarter <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Q3 2026, 2026-Q4"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Released">Released</option>
                  </select>
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Product Team, Sarah Chen"
                  />
                </div>

                {/* Business Goal */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Goal
                  </label>
                  <textarea
                    value={formData.business_goal}
                    onChange={(e) => setFormData({ ...formData, business_goal: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                    placeholder="What business outcome does this support?"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    {editingItem ? 'Save Changes' : 'Add to Roadmap'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
              </div>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete this roadmap item? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
