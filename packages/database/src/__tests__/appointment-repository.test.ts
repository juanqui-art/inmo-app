/**
 * APPOINTMENT REPOSITORY TESTS
 *
 * Tests for appointment operations: create, update, query, availability checks
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppointmentStatus } from "@prisma/client";

// Mock the database client BEFORE importing anything that uses it
vi.mock("../client", () => ({
  db: {
    appointment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { db } from "../client";
// Now import modules that depend on db
import {
  AppointmentRepository,
  appointmentSelect,
  appointmentDetailSelect,
} from "../repositories/appointments";

// Mock data
const mockUserId = "user-123";
const mockPropertyId = "prop-456";
const mockAgentId = "agent-789";
const mockAppointmentId = "apt-001";

const mockScheduledAt = new Date("2025-01-15T10:00:00Z");

const mockAppointment = {
  id: mockAppointmentId,
  userId: mockUserId,
  propertyId: mockPropertyId,
  agentId: mockAgentId,
  scheduledAt: mockScheduledAt,
  status: "PENDING" as AppointmentStatus,
  notes: "Quiero ver la propiedad",
  createdAt: new Date("2025-12-01T10:00:00Z"),
  updatedAt: new Date("2025-12-01T10:00:00Z"),
};

const mockAppointmentDetail = {
  ...mockAppointment,
  user: {
    id: mockUserId,
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "+593999123456",
    avatar: null,
  },
  property: {
    id: mockPropertyId,
    title: "Casa en venta",
    address: "Av. Ordóñez Lasso 123",
    city: "Cuenca",
    price: 150000,
    images: [{ url: "https://example.com/image1.jpg", alt: "Casa frente" }],
  },
  agent: {
    id: mockAgentId,
    name: "María López",
    email: "maria@example.com",
    phone: "+593999654321",
    avatar: null,
  },
};

describe("AppointmentRepository", () => {
  let repository: AppointmentRepository;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a fresh repository instance
    repository = new AppointmentRepository();
  });

  describe("createAppointment()", () => {
    it("should create a new appointment with required fields", async () => {
      // Arrange
      const appointmentData = {
        userId: mockUserId,
        propertyId: mockPropertyId,
        agentId: mockAgentId,
        scheduledAt: mockScheduledAt,
      };
      vi.mocked(db.appointment.create).mockResolvedValue(mockAppointmentDetail);

      // Act
      const result = await repository.createAppointment(appointmentData);

      // Assert
      expect(db.appointment.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          propertyId: mockPropertyId,
          agentId: mockAgentId,
          scheduledAt: mockScheduledAt,
          notes: undefined,
          status: "PENDING",
        },
        select: appointmentDetailSelect,
      });
      expect(result).toEqual(mockAppointmentDetail);
      expect(result.status).toBe("PENDING");
    });

    it("should create appointment with optional notes", async () => {
      // Arrange
      const appointmentData = {
        userId: mockUserId,
        propertyId: mockPropertyId,
        agentId: mockAgentId,
        scheduledAt: mockScheduledAt,
        notes: "Prefiero en la mañana",
      };
      vi.mocked(db.appointment.create).mockResolvedValue(mockAppointmentDetail);

      // Act
      await repository.createAppointment(appointmentData);

      // Assert
      expect(db.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: "Prefiero en la mañana",
          }),
        })
      );
    });

    it("should set status as PENDING by default", async () => {
      // Arrange
      const appointmentData = {
        userId: mockUserId,
        propertyId: mockPropertyId,
        agentId: mockAgentId,
        scheduledAt: mockScheduledAt,
      };
      vi.mocked(db.appointment.create).mockResolvedValue(mockAppointmentDetail);

      // Act
      await repository.createAppointment(appointmentData);

      // Assert
      expect(db.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PENDING",
          }),
        })
      );
    });

    it("should handle database errors", async () => {
      // Arrange
      const error = new Error("Database connection failed");
      vi.mocked(db.appointment.create).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.createAppointment({
          userId: mockUserId,
          propertyId: mockPropertyId,
          agentId: mockAgentId,
          scheduledAt: mockScheduledAt,
        })
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("getAppointmentById()", () => {
    it("should return appointment with full details", async () => {
      // Arrange
      vi.mocked(db.appointment.findUnique).mockResolvedValue(
        mockAppointmentDetail
      );

      // Act
      const result = await repository.getAppointmentById(mockAppointmentId);

      // Assert
      expect(db.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: mockAppointmentId },
        select: appointmentDetailSelect,
      });
      expect(result).toEqual(mockAppointmentDetail);
      expect(result?.user.name).toBe("Juan Pérez");
      expect(result?.property.title).toBe("Casa en venta");
      expect(result?.agent.name).toBe("María López");
    });

    it("should return null if appointment doesn't exist", async () => {
      // Arrange
      vi.mocked(db.appointment.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.getAppointmentById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("updateAppointmentStatus()", () => {
    it("should update status to CONFIRMED", async () => {
      // Arrange
      const updatedAppointment = {
        ...mockAppointmentDetail,
        status: "CONFIRMED" as AppointmentStatus,
      };
      vi.mocked(db.appointment.update).mockResolvedValue(updatedAppointment);

      // Act
      const result = await repository.updateAppointmentStatus(
        mockAppointmentId,
        "CONFIRMED"
      );

      // Assert
      expect(db.appointment.update).toHaveBeenCalledWith({
        where: { id: mockAppointmentId },
        data: { status: "CONFIRMED" },
        select: appointmentDetailSelect,
      });
      expect(result.status).toBe("CONFIRMED");
    });

    it("should update status to CANCELLED", async () => {
      // Arrange
      const cancelledAppointment = {
        ...mockAppointmentDetail,
        status: "CANCELLED" as AppointmentStatus,
      };
      vi.mocked(db.appointment.update).mockResolvedValue(cancelledAppointment);

      // Act
      const result = await repository.updateAppointmentStatus(
        mockAppointmentId,
        "CANCELLED"
      );

      // Assert
      expect(result.status).toBe("CANCELLED");
    });

    it("should update status to COMPLETED", async () => {
      // Arrange
      const completedAppointment = {
        ...mockAppointmentDetail,
        status: "COMPLETED" as AppointmentStatus,
      };
      vi.mocked(db.appointment.update).mockResolvedValue(completedAppointment);

      // Act
      const result = await repository.updateAppointmentStatus(
        mockAppointmentId,
        "COMPLETED"
      );

      // Assert
      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("getAgentAppointments()", () => {
    it("should return all appointments for an agent", async () => {
      // Arrange
      const mockAppointments = [mockAppointmentDetail];
      vi.mocked(db.appointment.findMany).mockResolvedValue(mockAppointments);

      // Act
      const result = await repository.getAgentAppointments(mockAgentId);

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith({
        where: { agentId: mockAgentId },
        select: appointmentDetailSelect,
        orderBy: { scheduledAt: "asc" },
        skip: undefined,
        take: undefined,
      });
      expect(result).toEqual(mockAppointments);
    });

    it("should filter by status", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      await repository.getAgentAppointments(mockAgentId, {
        status: "PENDING",
      });

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            agentId: mockAgentId,
            status: "PENDING",
          },
        })
      );
    });

    it("should filter by date range", async () => {
      // Arrange
      const startDate = new Date("2025-01-15T00:00:00Z");
      const endDate = new Date("2025-01-20T23:59:59Z");
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      await repository.getAgentAppointments(mockAgentId, {
        startDate,
        endDate,
      });

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            agentId: mockAgentId,
            scheduledAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        })
      );
    });

    it("should support pagination", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      await repository.getAgentAppointments(mockAgentId, {
        skip: 10,
        take: 20,
      });

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 20,
        })
      );
    });

    it("should order by scheduledAt ascending", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      await repository.getAgentAppointments(mockAgentId);

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { scheduledAt: "asc" },
        })
      );
    });
  });

  describe("getUserAppointments()", () => {
    it("should return all appointments for a user", async () => {
      // Arrange
      const mockAppointments = [mockAppointmentDetail];
      vi.mocked(db.appointment.findMany).mockResolvedValue(mockAppointments);

      // Act
      const result = await repository.getUserAppointments(mockUserId);

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: appointmentDetailSelect,
        orderBy: { scheduledAt: "desc" },
      });
      expect(result).toEqual(mockAppointments);
    });

    it("should order by scheduledAt descending (newest first)", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      await repository.getUserAppointments(mockUserId);

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { scheduledAt: "desc" },
        })
      );
    });

    it("should return empty array if user has no appointments", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.getUserAppointments(mockUserId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getPropertyAppointments()", () => {
    it("should return all appointments for a property", async () => {
      // Arrange
      const mockAppointments = [mockAppointment];
      vi.mocked(db.appointment.findMany).mockResolvedValue(mockAppointments);

      // Act
      const result = await repository.getPropertyAppointments(mockPropertyId);

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith({
        where: { propertyId: mockPropertyId },
        select: appointmentSelect,
        orderBy: { scheduledAt: "asc" },
      });
      expect(result).toEqual(mockAppointments);
    });

    it("should filter by status array", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      await repository.getPropertyAppointments(mockPropertyId, {
        status: ["PENDING", "CONFIRMED"],
      });

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            propertyId: mockPropertyId,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        })
      );
    });
  });

  describe("getAppointmentsInTimeRange()", () => {
    it("should return appointments within time range", async () => {
      // Arrange
      const startTime = new Date("2025-01-15T09:00:00Z");
      const endTime = new Date("2025-01-15T17:00:00Z");
      const mockAppointments = [
        { id: "apt-1", scheduledAt: new Date("2025-01-15T10:00:00Z") },
        { id: "apt-2", scheduledAt: new Date("2025-01-15T14:00:00Z") },
      ];
      vi.mocked(db.appointment.findMany).mockResolvedValue(mockAppointments);

      // Act
      const result = await repository.getAppointmentsInTimeRange(
        mockPropertyId,
        startTime,
        endTime
      );

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          scheduledAt: {
            gte: startTime,
            lte: endTime,
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        select: {
          id: true,
          scheduledAt: true,
        },
      });
      expect(result).toEqual(mockAppointments);
    });

    it("should only include PENDING and CONFIRMED statuses", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      await repository.getAppointmentsInTimeRange(
        mockPropertyId,
        new Date(),
        new Date()
      );

      // Assert
      expect(db.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ["PENDING", "CONFIRMED"] },
          }),
        })
      );
    });
  });

  describe("isSlotAvailable()", () => {
    it("should return true if slot is available", async () => {
      // Arrange
      vi.mocked(db.appointment.findFirst).mockResolvedValue(null);

      // Act
      const result = await repository.isSlotAvailable(
        mockPropertyId,
        mockScheduledAt
      );

      // Assert
      expect(db.appointment.findFirst).toHaveBeenCalledWith({
        where: {
          propertyId: mockPropertyId,
          scheduledAt: mockScheduledAt,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      });
      expect(result).toBe(true);
    });

    it("should return false if slot is taken", async () => {
      // Arrange
      vi.mocked(db.appointment.findFirst).mockResolvedValue(mockAppointment);

      // Act
      const result = await repository.isSlotAvailable(
        mockPropertyId,
        mockScheduledAt
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should only check PENDING and CONFIRMED appointments", async () => {
      // Arrange
      vi.mocked(db.appointment.findFirst).mockResolvedValue(null);

      // Act
      await repository.isSlotAvailable(mockPropertyId, mockScheduledAt);

      // Assert
      expect(db.appointment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ["PENDING", "CONFIRMED"] },
          }),
        })
      );
    });
  });

  describe("getAvailableSlots()", () => {
    it("should return all business hours if no appointments", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.getAvailableSlots(
        mockPropertyId,
        new Date("2025-01-15")
      );

      // Assert
      expect(result).toEqual([9, 10, 11, 13, 14, 15, 16]);
      expect(result).not.toContain(12); // Lunch hour excluded
    });

    it("should exclude booked hours", async () => {
      // Arrange
      // Use local time (not UTC) to match getHours() behavior
      const date9am = new Date("2025-01-15");
      date9am.setHours(9, 0, 0, 0);
      const date2pm = new Date("2025-01-15");
      date2pm.setHours(14, 0, 0, 0);

      const bookedAppointments = [
        { id: "apt-1", scheduledAt: date9am }, // 9am local
        { id: "apt-2", scheduledAt: date2pm }, // 2pm local
      ];
      vi.mocked(db.appointment.findMany).mockResolvedValue(bookedAppointments);

      // Act
      const result = await repository.getAvailableSlots(
        mockPropertyId,
        new Date("2025-01-15")
      );

      // Assert
      expect(result).toEqual([10, 11, 13, 15, 16]);
      expect(result).not.toContain(9);
      expect(result).not.toContain(14);
    });

    it("should exclude lunch hour (12pm) from available slots", async () => {
      // Arrange
      vi.mocked(db.appointment.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.getAvailableSlots(
        mockPropertyId,
        new Date("2025-01-15")
      );

      // Assert
      expect(result).not.toContain(12);
    });

    it("should handle fully booked day", async () => {
      // Arrange
      // Create appointments for all business hours using local time
      const fullyBookedDay = [9, 10, 11, 13, 14, 15, 16].map((hour, index) => {
        const date = new Date("2025-01-15");
        date.setHours(hour, 0, 0, 0);
        return {
          id: `apt-${index + 1}`,
          scheduledAt: date,
        };
      });
      vi.mocked(db.appointment.findMany).mockResolvedValue(fullyBookedDay);

      // Act
      const result = await repository.getAvailableSlots(
        mockPropertyId,
        new Date("2025-01-15")
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("deleteAppointment()", () => {
    it("should delete an appointment", async () => {
      // Arrange
      vi.mocked(db.appointment.delete).mockResolvedValue(mockAppointment);

      // Act
      const result = await repository.deleteAppointment(mockAppointmentId);

      // Assert
      expect(db.appointment.delete).toHaveBeenCalledWith({
        where: { id: mockAppointmentId },
      });
      expect(result).toEqual(mockAppointment);
    });

    it("should throw error if appointment doesn't exist", async () => {
      // Arrange
      const error = new Error("Record not found");
      vi.mocked(db.appointment.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.deleteAppointment("non-existent-id")
      ).rejects.toThrow("Record not found");
    });
  });

  describe("getAgentAppointmentStats()", () => {
    it("should return appointment counts by status", async () => {
      // Arrange
      const mockStats = [
        { status: "PENDING" as AppointmentStatus, _count: 5 },
        { status: "CONFIRMED" as AppointmentStatus, _count: 12 },
        { status: "COMPLETED" as AppointmentStatus, _count: 48 },
        { status: "CANCELLED" as AppointmentStatus, _count: 2 },
      ];
      vi.mocked(db.appointment.groupBy).mockResolvedValue(mockStats as any);

      // Act
      const result = await repository.getAgentAppointmentStats(mockAgentId);

      // Assert
      expect(db.appointment.groupBy).toHaveBeenCalledWith({
        by: ["status"],
        where: { agentId: mockAgentId },
        _count: true,
      });
      expect(result).toEqual({
        PENDING: 5,
        CONFIRMED: 12,
        COMPLETED: 48,
        CANCELLED: 2,
      });
    });

    it("should return 0 for statuses with no appointments", async () => {
      // Arrange
      const mockStats = [
        { status: "CONFIRMED" as AppointmentStatus, _count: 3 },
      ];
      vi.mocked(db.appointment.groupBy).mockResolvedValue(mockStats as any);

      // Act
      const result = await repository.getAgentAppointmentStats(mockAgentId);

      // Assert
      expect(result).toEqual({
        PENDING: 0,
        CONFIRMED: 3,
        COMPLETED: 0,
        CANCELLED: 0,
      });
    });

    it("should handle agent with no appointments", async () => {
      // Arrange
      vi.mocked(db.appointment.groupBy).mockResolvedValue([]);

      // Act
      const result = await repository.getAgentAppointmentStats(mockAgentId);

      // Assert
      expect(result).toEqual({
        PENDING: 0,
        CONFIRMED: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      });
    });
  });
});
