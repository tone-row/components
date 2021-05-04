import { Type, Box } from "../component/theme";

export default function Home() {
  return (
    <Box flow="column" content="normal start" items="center normal" gap={1}>
      <Type color="purple" as="h1">
        @tone-row/components
      </Type>
      <Type color="peachpuff" as="h2">
        Howdy World
      </Type>
      <Type color="saddlebrown" as="h3">
        Howdy World
      </Type>
      <Type color="purple" as="h4">
        Howdy World
      </Type>
    </Box>
  );
}
