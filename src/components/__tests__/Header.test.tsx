import { render, screen } from "@testing-library/react";
import { Header } from "../Header";

describe("Header", () => {
  it("renders the header with title", () => {
    render(<Header />);
    expect(screen.getByText("POPULATIONS")).toBeInTheDocument();
    expect(screen.getByText("JP")).toBeInTheDocument();
  });

  it("renders GitHub link with correct attributes", () => {
    render(<Header />);
    const githubLink = screen.getByRole("link", {
      name: "View source on GitHub",
    });

    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/yukikurage/yumemi-test"
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses semantic header element", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("has h1 heading for accessibility", () => {
    render(<Header />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("POPULATIONS");
  });
});
