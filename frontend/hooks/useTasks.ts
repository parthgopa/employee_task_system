"use client";

import { useCallback } from "react";
import { taskService } from "@/services/taskService";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/store/taskStore";
import { useNotificationStore } from "@/store/notificationStore";
import { todayStr } from "@/utils/dateUtils";
import toast from "react-hot-toast";

export function useTasks(currentViewDate?: string) {
  const { tasks, loading, setTasks, addTask, updateTask, removeTask, setLoading } =
    useTaskStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const viewDate = currentViewDate || todayStr();

  const fetchTodayTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getTodayTasks();
      setTasks(res.data.data || []);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [setTasks, setLoading]);

  const fetchTasksByDate = useCallback(
    async (date: string) => {
      setLoading(true);
      try {
        const res = await taskService.getTasksByDate(date);
        setTasks(res.data.data || []);
      } catch {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    },
    [setTasks, setLoading]
  );

  const createTask = useCallback(
    async (data: { title: string; description?: string; priority?: string; taskDate?: string }) => {
      try {
        const res = await taskService.createTask(data as Parameters<typeof taskService.createTask>[0]);
        const created = res.data.data as Task;

        if (created.taskDate === viewDate) {
          addTask(created);
        }

        addNotification({
          title: "New Task Added",
          message: `"${created.title}" scheduled for ${created.taskDate === todayStr() ? "today" : created.taskDate}`,
          type: "task_created",
        });

        toast.success("Task created!");
        return created;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to create task";
        toast.error(msg);
        throw err;
      }
    },
    [addTask, addNotification, viewDate]
  );

  const editTask = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (id: string, data: any) => {
      try {
        const res = await taskService.updateTask(id, data as Parameters<typeof taskService.updateTask>[1]);
        updateTask(id, res.data.data);
        toast.success("Task updated!");
      } catch {
        toast.error("Failed to update task");
        throw new Error("update failed");
      }
    },
    [updateTask]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await taskService.deleteTask(id);
        removeTask(id);
        toast.success("Task deleted");
      } catch {
        toast.error("Failed to delete task");
      }
    },
    [removeTask]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      try {
        const res = await taskService.toggleTask(id);
        const toggled = res.data.data;
        updateTask(id, toggled);

        if (toggled.status === "completed") {
          addNotification({
            title: "Task Completed",
            message: `"${toggled.title}" marked as done!`,
            type: "task_completed",
          });
        }
      } catch {
        toast.error("Failed to update task");
      }
    },
    [updateTask, addNotification]
  );

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return {
    tasks,
    loading,
    completedTasks,
    pendingTasks,
    completionRate,
    fetchTodayTasks,
    fetchTasksByDate,
    createTask,
    editTask,
    deleteTask,
    toggleTask,
  };
}
