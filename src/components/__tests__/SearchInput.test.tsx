import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "@/components/prefecture/SearchInput";

describe("SearchInput", () => {
  it("renders input with placeholder", () => {
    render(<SearchInput />);
    expect(
      screen.getByPlaceholderText("都道府県で絞り込み")
    ).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    render(<SearchInput onChange={mockOnChange} value="" />);

    const input = screen.getByPlaceholderText("都道府県で絞り込み");
    await user.type(input, "東京");

    // userEvent.type は1文字ずつ入力するため、各文字で呼ばれる
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith("東");
    expect(mockOnChange).toHaveBeenCalledWith("京");
  });

  it("displays clear button when input has value", () => {
    render(<SearchInput value="東京" />);
    const clearButton = screen.getByRole("button", { name: "検索をクリア" });
    expect(clearButton).toBeInTheDocument();
  });

  it("does not display clear button when input is empty", () => {
    render(<SearchInput value="" />);
    const clearButton = screen.queryByRole("button", { name: "検索をクリア" });
    expect(clearButton).not.toBeInTheDocument();
  });

  it("calls onChange with empty string when clear button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    render(<SearchInput onChange={mockOnChange} value="東京" />);

    const clearButton = screen.getByRole("button", { name: "検索をクリア" });
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });
});
