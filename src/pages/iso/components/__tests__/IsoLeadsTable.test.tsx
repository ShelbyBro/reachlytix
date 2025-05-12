
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IsoLeadsTable, IsoLead } from "../IsoLeadsTable";
import { vi, describe, it, expect, beforeEach } from "vitest";

describe("IsoLeadsTable", () => {
  // Mock functions for the component props
  const mockOnEdit = vi.fn();
  const mockOnNotes = vi.fn();
  const mockOnAssign = vi.fn(); // Add mock for the new onAssign prop

  // Helper function to create a valid IsoLead object for testing
  const createMockLead = (overrides = {}): IsoLead => ({
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

  // Reset mocks before each test
  beforeEach(() => {
    mockOnEdit.mockReset();
    mockOnNotes.mockReset();
    mockOnAssign.mockReset(); // Reset the new mock as well
  });

  it("renders loading state correctly", () => {
    render(
      <IsoLeadsTable
        leads={[]}
        loading={true}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders error state correctly", () => {
    render(
      <IsoLeadsTable
        leads={[]}
        loading={false}
        error={"Test error"}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    expect(screen.getByText(/Error loading leads/i)).toBeInTheDocument();
  });

  it("renders empty state correctly", () => {
    render(
      <IsoLeadsTable
        leads={[]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    expect(screen.getByText(/No leads found/i)).toBeInTheDocument();
  });

  it("renders leads correctly", () => {
    const mockLeads = [createMockLead()];
    
    render(
      <IsoLeadsTable
        leads={mockLeads}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    expect(screen.getByText("Test Lead")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("123-456-7890", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles leads with missing data", () => {
    const leadWithMissingData = createMockLead({
      lead: {
        name: "",
        email: null,
        phone: undefined,
        source: null
      },
      assigned_agent: null,
      notes: ""
    });

    render(
      <IsoLeadsTable
        leads={[leadWithMissingData]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    // Check if fallback values are displayed
    expect(screen.getAllByText("N/A")).not.toHaveLength(0);
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("No notes")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const mockLead = createMockLead();
    const user = userEvent.setup();
    
    render(
      <IsoLeadsTable
        leads={[mockLead]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    const editButton = screen.getAllByRole("button")[0]; // First button is edit
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockLead);
  });

  it("calls onNotes when notes button is clicked", async () => {
    const mockLead = createMockLead();
    const user = userEvent.setup();
    
    render(
      <IsoLeadsTable
        leads={[mockLead]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    const notesButton = screen.getAllByRole("button")[1]; // Second button is notes
    await user.click(notesButton);

    expect(mockOnNotes).toHaveBeenCalledWith(mockLead);
  });

  it("handles long notes with ellipsis", () => {
    const leadWithLongNotes = createMockLead({
      notes: "This is a very long note that should be truncated when displayed in the table to prevent it from taking up too much space and making the UI look cluttered and messy."
    });

    render(
      <IsoLeadsTable
        leads={[leadWithLongNotes]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );

    // The note should be rendered with the line-clamp class
    const noteElement = screen.getByText(/This is a very long note/);
    expect(noteElement).toHaveClass("line-clamp-1");
  });
  
  it("properly handles agent name display with nullable fields", () => {
    // Test with null first name
    const leadWithNullFirstName = createMockLead({
      assigned_agent: { first_name: null, last_name: "Doe" }
    });
    
    // Test with null last name
    const leadWithNullLastName = createMockLead({
      assigned_agent: { first_name: "John", last_name: null }
    });
    
    // Test with both null
    const leadWithBothNullNames = createMockLead({
      assigned_agent: { first_name: null, last_name: null }
    });
    
    render(
      <IsoLeadsTable
        leads={[leadWithNullFirstName, leadWithNullLastName, leadWithBothNullNames]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign} // Add onAssign prop
      />
    );
    
    expect(screen.getByText("Doe")).toBeInTheDocument(); // Only last name
    expect(screen.getByText("John")).toBeInTheDocument(); // Only first name
    expect(screen.getByText("N/A")).toBeInTheDocument(); // Both null shows N/A
  });

  // Add a test for the new onAssign functionality
  it("calls onAssign when assign button is clicked", async () => {
    const mockLead = createMockLead();
    const user = userEvent.setup();
    
    render(
      <IsoLeadsTable
        leads={[mockLead]}
        loading={false}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
      />
    );

    const assignButton = screen.getAllByRole("button")[2]; // Third button is assign
    await user.click(assignButton);

    expect(mockOnAssign).toHaveBeenCalledWith(mockLead);
  });
});
