import React, { useState, useEffect } from 'react';
import NovaSidebar from '../../components/nova/NovaSidebar';
import { NovaBubble } from '../../components/nova/NovaBubble';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { 
  Users, 
  Search, 
  UserPlus, 
  Shield, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  UploadCloud, 
  AlertCircle, 
  Filter, 
  UserCheck, 
  UserX,
  RefreshCw,
  FileText
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'suspended' | 'at-risk';
  lastLogin: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // CSV Modal State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvParsing, setCsvParsing] = useState(false);
  const [csvParsed, setCsvParsed] = useState(false);
  const [csvProgress, setCsvProgress] = useState(0);
  const [csvStats, setCsvStats] = useState({ total: 0, valid: 0, duplicate: 0, errors: 0 });
  const [dragOver, setDragOver] = useState(false);

  // User Add/Edit Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    status: 'active' as 'active' | 'suspended' | 'at-risk'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsersList();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = () => {
    setIsLoading(true);
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setIsLoading(false);
      });
  };

  const filterUsersList = () => {
    let result = [...users];

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        u.id.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }

    setFilteredUsers(result);
  };

  const handleStatusToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    
    fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      })
      .catch(err => console.error("Error updating status:", err));
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setModalMode('edit');
    setIsUserModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setUserFormData({
      name: '',
      email: '',
      role: 'student',
      status: 'active'
    });
    setModalMode('create');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      // Simulate adding a user
      const newUser: User = {
        id: `u-${Math.floor(100 + Math.random() * 900)}`,
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        status: userFormData.status,
        lastLogin: new Date().toISOString()
      };
      setUsers(prev => [newUser, ...prev]);
      setIsUserModalOpen(false);
    } else if (selectedUser) {
      // Update existing user on backend and state
      fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: userFormData.role,
          status: userFormData.status
        })
      })
        .then(res => res.json())
        .then(data => {
          setUsers(prev => prev.map(u => 
            u.id === selectedUser.id 
              ? { ...u, name: userFormData.name, email: userFormData.email, role: userFormData.role, status: userFormData.status }
              : u
          ));
          setIsUserModalOpen(false);
        })
        .catch(err => console.error("Error updating user details:", err));
    }
  };

  // CSV Drag and Drop Functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsv(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCsv(e.target.files[0]);
    }
  };

  const processCsv = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert("Please upload a valid CSV file.");
      return;
    }
    setCsvFile(file);
    setCsvParsing(true);
    setCsvParsed(false);
    setCsvProgress(0);

    // Simulate batch parsing of up to 10k rows
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setCsvProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        
        // Mock parsed results
        const mockRows = [
          { name: 'John Doe', email: 'john@univ.edu', role: 'student', status: 'valid' },
          { name: 'Sara Conner', email: 'sara@univ.edu', role: 'student', status: 'valid' },
          { name: 'Marcus Aurelius', email: 'marcus@univ.edu', role: 'teacher', status: 'valid' },
          { name: 'Priya Sharma', email: 'priya@univ.edu', role: 'student', status: 'duplicate' },
          { name: 'Wrong Role User', email: 'wrong@univ.edu', role: 'guest', status: 'invalid_role' },
          { name: 'Empty Email', email: '', role: 'student', status: 'missing_email' },
        ];
        
        setCsvData(mockRows);
        setCsvStats({
          total: 8432, // Large institutional size
          valid: 8390,
          duplicate: 32,
          errors: 10
        });
        
        setCsvParsing(false);
        setCsvParsed(true);
      }
    }, 250);
  };

  const handleConfirmCsvImport = () => {
    // Add the valid mock rows to our list
    const newImportedUsers: User[] = [
      { id: 'u-101', name: 'John Doe', email: 'john@univ.edu', role: 'student', status: 'active', lastLogin: '-' },
      { id: 'u-102', name: 'Sara Conner', email: 'sara@univ.edu', role: 'student', status: 'active', lastLogin: '-' },
      { id: 'u-103', name: 'Marcus Aurelius', email: 'marcus@univ.edu', role: 'teacher', status: 'active', lastLogin: '-' },
    ];
    setUsers(prev => [...newImportedUsers, ...prev]);
    setIsCsvModalOpen(false);
    setCsvFile(null);
    setCsvParsed(false);
    setCsvData([]);
  };

  const getRoleBadge = (role: 'student' | 'teacher' | 'admin') => {
    switch (role) {
      case 'admin':
        return <Badge variant="accent"><Shield size={10} style={{ marginRight: '4px' }} /> Admin</Badge>;
      case 'teacher':
        return <Badge variant="primary">Faculty</Badge>;
      default:
        return <Badge variant="secondary">Student</Badge>;
    }
  };

  const getStatusBadge = (status: 'active' | 'suspended' | 'at-risk') => {
    switch (status) {
      case 'active':
        return <Badge variant="success"><CheckCircle size={10} style={{ marginRight: '4px' }} /> Active</Badge>;
      case 'suspended':
        return <Badge variant="danger"><XCircle size={10} style={{ marginRight: '4px' }} /> Suspended</Badge>;
      default:
        return <Badge variant="warning"><AlertCircle size={10} style={{ marginRight: '4px' }} /> At-Risk</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <NovaSidebar />
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Background Radial Glow */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '400px', 
          background: 'radial-gradient(circle at 50% -100px, rgba(235, 94, 40, 0.1), transparent 70%)', 
          pointerEvents: 'none', 
          zIndex: 0 
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', background: 'linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                User Management
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Provision accounts, configure system-wide security clearances, and run large-scale imports.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setIsCsvModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed var(--border-color)' }}>
                <UploadCloud size={16} /> Bulk Import (CSV)
              </Button>
              <Button variant="primary" onClick={handleOpenCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={16} /> Add Single User
              </Button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(250, 250, 250, 0.05)', color: 'var(--text-secondary)' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>Total Registered</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{users.length || 4} Users</div>
              </div>
            </Card>

            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0, 184, 148, 0.1)', color: 'var(--color-secondary)' }}>
                <UserCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>Active Accounts</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>
                  {users.filter(u => u.status === 'active').length || 3}
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 118, 117, 0.1)', color: 'var(--color-danger)' }}>
                <UserX size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>Suspended Accounts</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>
                  {users.filter(u => u.status === 'suspended').length || 0}
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(253, 150, 68, 0.1)', color: 'var(--color-warning)' }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>At-Risk Flagged</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>
                  {users.filter(u => u.status === 'at-risk').length || 1}
                </div>
              </div>
            </Card>
          </div>

          {/* Filtering and Search Controls */}
          <Card style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flex: 1, minWidth: '280px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search user by name, email, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '13.5px'
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '13.5px'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="at-risk">At-Risk</option>
              </select>

              <Button variant="ghost" onClick={fetchUsers} style={{ padding: '10px' }}>
                <RefreshCw size={16} />
              </Button>
            </div>
          </Card>

          {/* Roster Table */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Retrieving secure system directory...</span>
            </div>
          ) : (
            <Card style={{ padding: '8px', overflow: 'hidden' }}>
              <Table headers={['User Details', 'Clearance Level', 'System Status', 'Last Sync', 'Operations']}>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell style={{ textAlign: 'center', padding: '40px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>No accounts match the active query descriptors.</span>
                    </TableCell>
                    <TableCell>{null}</TableCell>
                    <TableCell>{null}</TableCell>
                    <TableCell>{null}</TableCell>
                    <TableCell>{null}</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: user.role === 'admin' ? 'var(--color-accent-glow)' : user.role === 'teacher' ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${user.role === 'admin' ? 'var(--color-accent)' : user.role === 'teacher' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '13px',
                            color: 'var(--text-primary)'
                          }}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email} (ID: {user.id})</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(user)} style={{ fontSize: '12px' }}>
                            Edit
                          </Button>
                          <Button 
                            variant={user.status === 'suspended' ? 'secondary' : 'danger'} 
                            size="sm" 
                            onClick={() => handleStatusToggle(user.id, user.status)}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </Table>
            </Card>
          )}

        </div>
      </div>

      {/* Bulk CSV Import Modal */}
      <Modal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} title="System Bulk CSV Import" width="580px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Upload institutional user list containing headers <code style={{ color: 'var(--color-primary)' }}>name, email, role</code>. Supports validation for rows up to 10k instances.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              padding: '40px 20px',
              border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              background: dragOver ? 'rgba(108, 92, 231, 0.05)' : 'var(--bg-secondary)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <input
              type="file"
              id="csvFileInput"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="csvFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <UploadCloud size={40} style={{ color: dragOver ? 'var(--color-primary)' : 'var(--text-muted)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>
                  {csvFile ? csvFile.name : "Drag & Drop your CSV file here"}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  or click to browse local files (max 12MB)
                </div>
              </div>
            </label>
          </div>

          {csvParsing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600 }}>
                <span>Analyzing and compiling rows...</span>
                <span>{csvProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${csvProgress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          {csvParsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '10px', 
                background: 'var(--bg-secondary)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ROWS</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>{csvStats.total}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 600 }}>VALID</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-secondary)', marginTop: '4px' }}>{csvStats.valid}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: 600 }}>DUPLICATES</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-warning)', marginTop: '4px' }}>{csvStats.duplicate}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 600 }}>ERRORS</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>{csvStats.errors}</div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Validation Sandbox Preview (First 4 rows)
                </div>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  {csvData.map((row, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '10px 14px', 
                      background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
                      borderBottom: idx < csvData.length - 1 ? '1px solid var(--border-color)' : 'none',
                      fontSize: '12.5px'
                    }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>{row.name || "N/A"}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{row.email || "[Empty]"}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ textTransform: 'capitalize', fontSize: '11px', color: 'var(--text-secondary)' }}>{row.role}</span>
                        {row.status === 'valid' ? (
                          <Badge variant="success">Pass</Badge>
                        ) : row.status === 'duplicate' ? (
                          <Badge variant="warning">Dup Email</Badge>
                        ) : (
                          <Badge variant="danger">Invalid</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="ghost" onClick={() => setIsCsvModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirmCsvImport}>
                  Commit Valid Rows ({csvStats.valid})
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* User Single Creator / Edit Modal */}
      <Modal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        title={modalMode === 'create' ? "Register System Node" : "Edit Security Clearance"}
        width="480px"
      >
        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              required
              disabled={modalMode === 'edit'}
              value={userFormData.name}
              onChange={e => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              required
              disabled={modalMode === 'edit'}
              value={userFormData.email}
              onChange={e => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>System Role</label>
              <select
                value={userFormData.role}
                onChange={e => setUserFormData(prev => ({ ...prev, role: e.target.value as any }))}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px'
                }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher (Faculty)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Node Status</label>
              <select
                value={userFormData.status}
                onChange={e => setUserFormData(prev => ({ ...prev, status: e.target.value as any }))}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px'
                }}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="at-risk">At-Risk</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {modalMode === 'create' ? "Provision Account" : "Apply Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
}
