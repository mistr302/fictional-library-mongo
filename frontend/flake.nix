{
  description = "Development environment for JavaScript/TypeScript backend development";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # sigma qwen code
            qwen-code
            # Node.js and related tools
            nodejs
            nodemon
            # TypeScript and development tools
            typescript

            # # Linters and formatters
            # eslint
            # prettier
            # tsc

            # # Testing frameworks
            # jest
            # vitest

            # # Additional useful tools
            # bun
            # deno
            # nodePackages.typescript-language-server
          ];

          # Environment variables
          NODE_PATH = "${pkgs.nodejs}/lib/node_modules";

          # Shell initialization
          shellHook = ''
            echo "JavaScript/TypeScript Backend Development Environment"
            echo "Available tools:"
            echo "- Node.js: $(node --version)"
            echo "- npm: $(npm --version)"
            echo "- TypeScript: $(tsc --version)"
            alias vibe="qwen --yolo"
            # echo "- ESLint: $(eslint --version)"
            # echo "- Prettier: $(prettier --version)"
            echo ""
            echo "Happy jelqing!"
          '';
        };

        packages.default = self.packages.${system}.devShells.default;
      }
    );
}
