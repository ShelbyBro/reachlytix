
import { render, screen } from "@testing-library/react";
import { IsoLeadsTable } from "../IsoLeadsTable";
import { describe, it, expect, beforeEach } from "vitest";
import { mockOnEdit, mockOnNotes, mockOnAssign, resetMocks } from "./utils/IsoLeadTestUtils";

describe("IsoLeadsTable Render States", () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  it("renders loading state correctly", () => {
    render(
      <IsoLeadsTable
        leads={[]}
        loading={true}
        error={null}
        onEdit={mockOnEdit}
        onNotes={mockOnNotes}
        onAssign={mockOnAssign}
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
        onAssign={mockOnAssign}
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
        onAssign={mockOnAssign}
      />
    );

    expect(screen.getByText(/No leads found/i)).toBeInTheDocument();
  });
});
