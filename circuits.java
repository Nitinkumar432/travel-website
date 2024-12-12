import java.util.*;

public class circuits {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        Map<String, String[]> gates = new HashMap<>();
        
        for (int i = 0; i < n; ++i) {
            String[] parts = sc.nextLine().trim().split("=");
            String gate = parts[0].trim();
            String[] gateDetails = parts[1].trim().split("[(), ]+");
            gates.put(gate, gateDetails);
        }

        int cycles = Integer.parseInt(sc.nextLine().trim());
        Map<String, int[]> values = new HashMap<>();
        
        while (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            if (line.matches("[a-zA-Z]+")) {
                String target = line.trim();
                simulateCircuit(gates, values, target, cycles);
                break;
            }
            String[] parts = line.split(" ");
            String name = parts[0];
            int[] timeValues = Arrays.stream(parts, 1, parts.length).mapToInt(Integer::parseInt).toArray();
            values.put(name, timeValues);
        }
        
        sc.close();
    }

    private static void simulateCircuit(Map<String, String[]> gates, Map<String, int[]> values, String target, int cycles) {
        Map<String, int[]> output = new HashMap<>();
        
        for (String gate : gates.keySet()) {
            output.put(gate, new int[cycles]);
        }
        
        for (int cycle = 1; cycle < cycles; cycle++) {
            for (String gate : gates.keySet()) {
                String[] details = gates.get(gate);
                String operation = details[0];
                String input1 = details[1];
                String input2 = details[2];

                int val1 = getValue(input1, output, values, cycle - 1);
                int val2 = getValue(input2, output, values, cycle - 1);

                int result = computeGate(operation, val1, val2);
                output.get(gate)[cycle] = result;
            }
        }
        
        int[] targetOutput = output.get(target);
        for (int i = 0; i < cycles; ++i) {
            System.out.print(targetOutput[i] + (i == cycles - 1 ? "\n" : " "));
        }
    }

    private static int getValue(String name, Map<String, int[]> output, Map<String, int[]> values, int cycle) {
        if (values.containsKey(name)) {
            return values.get(name)[cycle];
        } else {
            return output.get(name)[cycle];
        }
    }

    public static int computeGate(String operation, int value1, int value2) {
        int result;
        switch (operation) {
            case "AND":
                result = value1 & value2;
                break;
            case "OR":
                result = value1 | value2;
                break;
            case "NAND":
                result = ~(value1 & value2) & 1;
                break;
            case "NOR":
                result = ~(value1 | value2) & 1;
                break;
            case "XOR":
                result = value1 ^ value2;
                break;
            default:
                result = 0;
                break;
        }
        return result;
    }
}
