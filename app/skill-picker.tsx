"use client";
import { useState } from "react";
import { Choice, Field } from "./ui-kit";
import { Button } from "@/components/ui/button";
const groups: Record<string, string[]> = {
  "Computer Science / IT": [
    "C",
    "C++",
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "DSA",
    "SQL",
    "React",
    "Node.js",
    "Machine Learning",
    "Cybersecurity",
    "Cloud Computing",
    "Git",
  ],
  "Electronics / Communication": [
    "Digital Electronics",
    "Analog Circuits",
    "VLSI",
    "Verilog",
    "Embedded Systems",
    "Signal Processing",
    "PCB Design",
    "IoT",
  ],
  Electrical: [
    "Circuit Analysis",
    "Power Systems",
    "Electrical Machines",
    "Control Systems",
    "PLC",
    "MATLAB",
    "Power Electronics",
  ],
  Mechanical: [
    "CAD",
    "SolidWorks",
    "Thermodynamics",
    "Fluid Mechanics",
    "ANSYS",
    "Manufacturing",
    "Robotics",
    "GD&T",
  ],
  Civil: [
    "AutoCAD",
    "Structural Analysis",
    "STAAD.Pro",
    "Revit",
    "Surveying",
    "Geotechnical Engineering",
    "BIM",
    "Construction Management",
  ],
  Chemical: [
    "Process Design",
    "Aspen Plus",
    "Heat Transfer",
    "Mass Transfer",
    "Reaction Engineering",
    "Process Safety",
  ],
  Aerospace: [
    "Aerodynamics",
    "Propulsion",
    "Flight Mechanics",
    "CFD",
    "Aircraft Structures",
  ],
  "Biomedical / Biotechnology": [
    "Bioinformatics",
    "Medical Imaging",
    "Biosensors",
    "Bioprocess Engineering",
    "Biomedical Instrumentation",
  ],
  "Production / Industrial": [
    "Lean Manufacturing",
    "Six Sigma",
    "Operations Research",
    "Quality Control",
    "Supply Chain",
  ],
  "Materials / Metallurgy": [
    "Materials Characterization",
    "Metallurgy",
    "Heat Treatment",
    "Composites",
    "Corrosion",
  ],
  "Other engineering branches": [
    "Agricultural Engineering",
    "Mining Engineering",
    "Petroleum Engineering",
    "Marine Engineering",
    "Textile Engineering",
    "Environmental Engineering",
    "Instrumentation",
    "Mechatronics",
  ],
  "Common skills": [
    "Communication",
    "Technical Writing",
    "Problem Solving",
    "Teamwork",
    "Project Management",
    "Excel",
  ],
};
const additions: Record<string, string[]> = {
  "Computer Science / IT": [
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Next.js",
    "Vue.js",
    "Angular",
    "Express.js",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    "ASP.NET",
    "Go",
    "Rust",
    "Kotlin",
    "Swift",
    "Dart",
    "Flutter",
    "React Native",
    "Android Development",
    "iOS Development",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "Firebase",
    "Supabase",
    "REST APIs",
    "GraphQL",
    "WebSockets",
    "System Design",
    "Operating Systems",
    "Computer Networks",
    "DBMS",
    "OOP",
    "Linux",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Google Cloud",
    "CI/CD",
    "Jenkins",
    "Terraform",
    "Testing",
    "Jest",
    "Playwright",
    "Selenium",
    "Data Engineering",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "PyTorch",
    "TensorFlow",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "LLMs",
    "RAG",
    "MLOps",
    "Power BI",
    "Tableau",
    "Data Visualization",
    "Statistics",
    "Competitive Programming",
    "Web Security",
    "Cryptography",
    "Ethical Hacking",
    "Blockchain",
    "Distributed Systems",
    "Compiler Design",
  ],
  "Electronics / Communication": [
    "SystemVerilog",
    "VHDL",
    "FPGA",
    "ASIC Design",
    "RTL Design",
    "UVM",
    "Digital Signal Processing",
    "Communication Systems",
    "RF Design",
    "Antenna Design",
    "Microwave Engineering",
    "Wireless Communication",
    "5G Networks",
    "Microprocessors",
    "Microcontrollers",
    "ARM",
    "Arduino",
    "ESP32",
    "STM32",
    "RTOS",
    "Embedded C",
    "I2C",
    "SPI",
    "UART",
    "CAN Bus",
    "Altium Designer",
    "KiCad",
    "LTspice",
    "Cadence Virtuoso",
    "Vivado",
    "CMOS Design",
    "Optical Communication",
    "Radar Systems",
    "Semiconductor Devices",
  ],
  Electrical: [
    "Network Theory",
    "Power Distribution",
    "Power Transmission",
    "Power System Protection",
    "Relay Coordination",
    "Transformers",
    "Motor Drives",
    "Electric Vehicles",
    "Battery Management Systems",
    "Renewable Energy",
    "Solar PV Design",
    "SCADA",
    "HMI",
    "Industrial Automation",
    "ETAP",
    "PSCAD",
    "Simulink",
    "Electrical Safety",
    "High Voltage Engineering",
    "Energy Auditing",
    "Electrical CAD",
    "Load Flow Analysis",
    "Smart Grids",
  ],
  Mechanical: [
    "Engineering Mechanics",
    "Strength of Materials",
    "Machine Design",
    "Kinematics",
    "Dynamics",
    "Vibrations",
    "Heat Transfer",
    "HVAC",
    "Refrigeration",
    "Finite Element Analysis",
    "Computational Fluid Dynamics",
    "CATIA",
    "PTC Creo",
    "Siemens NX",
    "Fusion 360",
    "CNC Programming",
    "CAM",
    "3D Printing",
    "Welding",
    "Casting",
    "Machining",
    "Metrology",
    "Hydraulics",
    "Pneumatics",
    "Tribology",
    "Maintenance Engineering",
    "Product Design",
  ],
  Civil: [
    "Concrete Technology",
    "Reinforced Concrete Design",
    "Steel Structures",
    "ETABS",
    "SAP2000",
    "SAFE",
    "Civil 3D",
    "Tekla Structures",
    "Primavera P6",
    "MS Project",
    "Quantity Surveying",
    "Estimation and Costing",
    "Transportation Engineering",
    "Highway Design",
    "Hydrology",
    "Water Resources",
    "Environmental Engineering",
    "Foundation Engineering",
    "Soil Mechanics",
    "GIS",
    "Remote Sensing",
    "Total Station",
    "Construction Safety",
    "Building Services",
    "Earthquake Engineering",
  ],
  Chemical: [
    "Chemical Thermodynamics",
    "Fluid Flow",
    "Process Simulation",
    "Aspen HYSYS",
    "CHEMCAD",
    "Distillation",
    "Separation Processes",
    "Process Control",
    "P&ID",
    "Equipment Sizing",
    "HAZOP",
    "Petrochemical Processes",
    "Polymer Technology",
    "Catalysis",
    "Industrial Chemistry",
    "Transport Phenomena",
    "Process Optimization",
    "Waste Treatment",
    "Scale-up",
    "Plant Design",
  ],
  Aerospace: [
    "Orbital Mechanics",
    "Spacecraft Design",
    "Avionics",
    "Flight Control",
    "Wind Tunnel Testing",
    "Gas Dynamics",
    "Turbomachinery",
    "Rocket Propulsion",
    "Composite Structures",
    "UAV Design",
    "Drone Navigation",
    "Flight Simulation",
    "Aeroelasticity",
    "Satellite Systems",
    "Mission Design",
  ],
  "Biomedical / Biotechnology": [
    "Biomechanics",
    "Biomaterials",
    "Medical Electronics",
    "Medical Signal Processing",
    "Prosthetics",
    "Rehabilitation Engineering",
    "Molecular Biology",
    "Genetic Engineering",
    "Cell Culture",
    "Microbiology",
    "Fermentation",
    "Downstream Processing",
    "Genomics",
    "Proteomics",
    "Biostatistics",
    "Laboratory Techniques",
    "Clinical Engineering",
    "Medical Device Design",
  ],
  "Production / Industrial": [
    "Production Planning",
    "Inventory Management",
    "Logistics",
    "ERP",
    "SAP PP",
    "Time and Motion Study",
    "Ergonomics",
    "Work Study",
    "Statistical Process Control",
    "Reliability Engineering",
    "FMEA",
    "Kaizen",
    "Value Stream Mapping",
    "Facility Planning",
    "Simulation",
    "Design of Experiments",
  ],
  "Materials / Metallurgy": [
    "Physical Metallurgy",
    "Extractive Metallurgy",
    "Powder Metallurgy",
    "Failure Analysis",
    "SEM",
    "XRD",
    "TEM",
    "Mechanical Testing",
    "Welding Metallurgy",
    "Phase Diagrams",
    "Ceramics",
    "Polymers",
    "Nanomaterials",
    "Surface Engineering",
    "Non-destructive Testing",
  ],
  Instrumentation: [
    "Sensors and Transducers",
    "Measurement Systems",
    "Calibration",
    "Process Instrumentation",
    "PID Control",
    "DCS",
    "PLC Programming",
    "LabVIEW",
    "Data Acquisition",
    "Industrial Networking",
    "Control Valve Sizing",
    "Instrument Loop Diagrams",
  ],
  "Mechatronics / Robotics": [
    "Robot Kinematics",
    "ROS",
    "ROS 2",
    "Motion Planning",
    "Robot Perception",
    "SLAM",
    "Sensor Fusion",
    "Servo Drives",
    "Automation",
    "Embedded Control",
    "Computer Vision",
    "Robot Simulation",
  ],
  Automobile: [
    "Vehicle Dynamics",
    "Automotive Design",
    "IC Engines",
    "EV Powertrains",
    "Battery Technology",
    "ADAS",
    "Automotive Electronics",
    "CAN Bus",
    "AUTOSAR",
    "Vehicle Diagnostics",
    "Emission Control",
    "Chassis Design",
  ],
  Environmental: [
    "Water Treatment",
    "Wastewater Treatment",
    "Air Pollution Control",
    "Solid Waste Management",
    "Environmental Impact Assessment",
    "Environmental Monitoring",
    "Life Cycle Assessment",
    "Sustainability",
    "Hydrology",
    "GIS",
    "Waste Management",
  ],
  "Agricultural / Food": [
    "Farm Machinery",
    "Irrigation Engineering",
    "Soil and Water Conservation",
    "Precision Agriculture",
    "Food Processing",
    "Food Safety",
    "Post-harvest Technology",
    "Dairy Engineering",
    "Cold Chain",
    "Agricultural Automation",
  ],
  Mining: [
    "Mine Planning",
    "Rock Mechanics",
    "Mineral Processing",
    "Drilling and Blasting",
    "Mine Ventilation",
    "Mine Safety",
    "Geology",
    "Surveying",
    "Open-pit Mining",
    "Underground Mining",
  ],
  Petroleum: [
    "Reservoir Engineering",
    "Drilling Engineering",
    "Well Logging",
    "Production Engineering",
    "Petroleum Geology",
    "Enhanced Oil Recovery",
    "Well Testing",
    "Petrophysics",
    "Offshore Engineering",
  ],
  "Marine / Naval": [
    "Ship Design",
    "Naval Architecture",
    "Marine Propulsion",
    "Ship Structures",
    "Marine Hydrodynamics",
    "Ship Stability",
    "Marine Electrical Systems",
    "Ocean Engineering",
    "Marine Safety",
  ],
  Textile: [
    "Spinning",
    "Weaving",
    "Knitting",
    "Textile Testing",
    "Dyeing",
    "Textile Printing",
    "Technical Textiles",
    "Fibre Science",
    "Garment Manufacturing",
    "Textile Chemistry",
  ],
  "Common skills": [
    "Presentation Skills",
    "Leadership",
    "Critical Thinking",
    "Research",
    "Documentation",
    "Public Speaking",
    "Time Management",
    "Agile",
    "Scrum",
    "Design Thinking",
    "Entrepreneurship",
    "Business Analysis",
    "Interview Preparation",
  ],
};
delete groups["Other engineering branches"];
for (const [branch, skills] of Object.entries(additions))
  groups[branch] = [...new Set([...(groups[branch] || []), ...skills])];
export function SkillPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [search, setSearch] = useState(""),
    [custom, setCustom] = useState(""),
    [other, setOther] = useState(false),
    [error, setError] = useState("");
  const selected = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  function add(skill: string) {
    const clean = skill.trim();
    if (!clean) return;
    if (clean.includes(",") || clean.length > 80) {
      setError("Use one skill at a time, up to 80 characters.");
      return;
    }
    if (selected.some((s) => s.toLowerCase() === clean.toLowerCase())) return;
    const next = [...selected, clean].join(", ");
    if (next.length > 2000) {
      setError("Skill list is full. Remove a skill first.");
      return;
    }
    onChange(next);
    setCustom("");
    setError("");
  }
  return (
    <section>
      <h4>Engineering skills</h4>
      <p>All skills stay available regardless of your engineering branch.</p>
      <details className="skill-select">
        <summary>
          Select skills <span>{selected.length} selected ▾</span>
        </summary>
        <Field label="Search all coding and engineering skills">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a skill"
          />
        </Field>
        <div className="skill-options">
          {[...new Set(Object.values(groups).flat())]
            .filter((s) => s.toLowerCase().includes(search.toLowerCase()))
            .map((skill) => (
              <label className="skill-option" key={skill}>
                <input
                  type="checkbox"
                  checked={selected.includes(skill)}
                  onChange={() =>
                    selected.includes(skill)
                      ? onChange(selected.filter((s) => s !== skill).join(", "))
                      : add(skill)
                  }
                />
                <span>{skill}</span>
              </label>
            ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOther(!other)}
          >
            Other / add your own
          </Button>
        </div>
      </details>
      {other && (
        <div className="actions">
          <input
            aria-label="Custom skill"
            value={custom}
            maxLength={80}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(custom);
              }
            }}
          />
          <Button type="button" onClick={() => add(custom)}>
            Add skill
          </Button>
        </div>
      )}
      <p>
        Selected skills · {selected.length}. Save your profile below to keep
        changes.
      </p>
      <div className="skill-tags">
        {selected.map((skill) => (
          <button
            className="skill-tag"
            type="button"
            key={skill}
            aria-label={`Remove ${skill}`}
            onClick={() =>
              onChange(selected.filter((s) => s !== skill).join(", "))
            }
          >
            {skill} ×
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
