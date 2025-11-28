/**
 * LogsAdminPortal - Dedicated portal for System & Logs Admin
 * 
 * Monitors backend logs, server health, error reports, and generates system reports
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, RefreshCw, 
  AlertCircle, CheckCircle2, Clock, Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const LogsAdminPortal = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // all, error, warn, info
  const [serverHealth, setServerHealth] = useState({
    status: 'healthy',
    uptime: 0,
    memory: 0,
    cpu: 0
  });

  useEffect(() => {
    loadLogs();
    loadServerHealth();
  }, [token]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getActivityLogs(token, { limit: 500 });
      setLogs(response.data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const loadServerHealth = async () => {
    // TODO: Fetch server health from API
    setServerHealth({
      status: 'healthy',
      uptime: 86400,
      memory: 65,
      cpu: 45
    });
  };

  const handleExportLogs = async () => {
    try {
      const response = await adminService.exportActivityLogs(token);
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details)?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-charcoal flex items-center gap-2">
                <FileText size={32} className="text-gray-700" />
                System & Logs Management
              </h1>
              <p className="text-neutral-600 mt-1">
                Monitor backend logs, server health, error reports, and generate system reports
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportLogs}
                className="btn-outline flex items-center gap-2"
              >
                <Download size={20} />
                Export Logs
              </button>
              <button
                onClick={loadLogs}
                className="btn-outline flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Server Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Server Status</p>
                <p className={`text-2xl font-bold ${
                  serverHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {serverHealth.status}
                </p>
              </div>
              {serverHealth.status === 'healthy' ? (
                <CheckCircle2 className="text-green-600" size={32} />
              ) : (
                <AlertCircle className="text-red-600" size={32} />
              )}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Uptime</p>
                <p className="text-2xl font-bold text-charcoal">
                  {Math.floor(serverHealth.uptime / 3600)}h
                </p>
              </div>
              <Clock className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Memory Usage</p>
                <p className="text-2xl font-bold text-charcoal">{serverHealth.memory}%</p>
              </div>
              <Server className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">CPU Usage</p>
                <p className="text-2xl font-bold text-charcoal">{serverHealth.cpu}%</p>
              </div>
              <Server className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search logs..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-field md:w-48"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        {/* Logs List */}
        <div className="card p-6">
          <h2 className="font-heading text-xl font-bold text-charcoal mb-4">System Logs</h2>
          {filteredLogs.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No logs found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-charcoal">
                        {log.action} • {log.module}
                      </p>
                      <p className="text-sm text-neutral-600 mt-1">
                        {log.adminRole && (
                          <span className="inline-block mr-2">
                            Role: {log.adminRole}
                          </span>
                        )}
                        {log.timestamp && new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.details && (
                        <pre className="text-xs text-neutral-500 mt-2 bg-white p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsAdminPortal;

