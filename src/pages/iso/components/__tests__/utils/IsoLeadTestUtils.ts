
import { vi } from "vitest";
import { IsoLead } from "../../IsoLeadsTable";

// Common mock functions used across all test files
export const mockOnEdit = vi.fn();
export const mockOnNotes = vi.fn();
export const mockOnAssign = vi.fn();

// Reset mocks helper function
export const resetMocks = () => {
  mockOnEdit.mockReset();
  mockOnNotes.mockReset();
  mockOnAssign.mockReset();
};

// Helper function to create a valid IsoLead object for testing
export const createMockLead = (overrides = {}): IsoLead => ({
  id: "1",
  iso_id: "iso-1",
  lead_id: "lead-1",
  assigned_agent_id: "agent-1",
  status: "unassigned",
  notes: null,
  created_at: "2023-01-01T00:00:00Z",
  lead: {
    name: "Test Lead",
    email: "test@example.com",
    phone: "123-456-7890",
    source: "website"
  },
  assigned_agent: {
    first_name: "John",
    last_name: "Doe"
  },
  ...overrides
});
