import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrefectureChip } from "../PrefectureChip";

describe("PrefectureChip", () => {
  const mockPrefecture = {
    prefCode: 1,
    prefName: "北海道",
  };

  const mockOnRemove = jest.fn();

  beforeEach(() => {
    mockOnRemove.mockClear();
  });

  it("renders prefecture name", () => {
    render(
      <PrefectureChip prefecture={mockPrefecture} onRemove={mockOnRemove} />
    );
    expect(screen.getByText("北海道")).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PrefectureChip prefecture={mockPrefecture} onRemove={mockOnRemove} />
    );

    const removeButton = screen.getByRole("button", {
      name: "北海道を削除",
    });
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it("has accessible remove button", () => {
    render(
      <PrefectureChip prefecture={mockPrefecture} onRemove={mockOnRemove} />
    );

    const removeButton = screen.getByRole("button", {
      name: "北海道を削除",
    });
    expect(removeButton).toBeInTheDocument();
  });
});
