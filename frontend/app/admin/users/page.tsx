'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/adminApi';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await adminApi.getUsers(page, search);
    if (data) {
      const result = data as { users: User[]; totalPages: number };
      setUsers(result.users);
      setTotalPages(result.totalPages);
    }
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    await adminApi.updateUserRole(id, newRole);
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      await adminApi.deleteUser(id);
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h2>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Người dùng</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Vai trò</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ngày tạo</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy người dùng
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
