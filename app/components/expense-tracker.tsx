'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpenseData {
  category: string;
  amount: number;
}

interface ExpenseTrackerProps {
  expenses: ExpenseData[];
  onExpenseAdded: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ExpenseTracker({ expenses, onExpenseAdded }: ExpenseTrackerProps) {
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount) return;

    setIsAdding(true);
    try {
      const currentDate = new Date();
      const { error } = await supabase
        .from('expenses')
        .insert({
          category: newExpense.category,
          amount: parseFloat(newExpense.amount),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        });

      if (error) throw error;

      // Reset form
      setNewExpense({ category: '', amount: '', description: '' });
      
      // Refresh data
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office Rent">Office Rent</SelectItem>
                    <SelectItem value="Software Subscriptions">Software Subscriptions</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                />
              </div>
            </div>
            <Button 
              onClick={handleAddExpense} 
              disabled={isAdding || !newExpense.category || !newExpense.amount}
            >
              {isAdding ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Month Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total: ${totalExpenses.toLocaleString()}</h3>
              <div className="space-y-2">
                {expenses.map((expense, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{expense.category}</span>
                    <span className="font-medium">${expense.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-64">
              {expenses.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}