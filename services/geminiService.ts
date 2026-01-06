
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { AnalysisResult, Scenario, MxRecord, BlacklistResult, SSLCheckResult, HAREntrySummary, DNSRecord, CertDetails, Packet } from "../types";

// Always initialize GoogleGenAI using the process.env.API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using recommended models based on task type.
const DEFAULT_FLASH = 'gemini-3-flash-preview';
const DEFAULT_PRO = 'gemini-3-pro-preview';

/**
 * Robust wrapper for generateContent with simple retry logic for transient errors.
 */
async function robustGenerate(params: GenerateContentParameters, retries = 2): Promise<any> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      lastError = error;
      // If it's a 500 or Rpc/XHR error, retry after a short delay
      const isTransient = error?.status === "UNKNOWN" || error?.code === 500 || error?.message?.includes("xhr");
      if (isTransient && i < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export interface CDNCheckResult {
  dns: {
    a: string[];
    cname: string;
    provider: string;
  };
  headers: Record<string, string>;
  performance: {
    region: string;
    ttfb: number;
    status: string;
  }[];
  analysis: AnalysisResult;
}

export const simulateCDNCheck = async (domain: string, customRecords?: DNSRecord[]): Promise<CDNCheckResult | null> => {
  try {
    const context = customRecords ? `Use these custom user-defined DNS records for the simulation: ${JSON.stringify(customRecords)}` : "";
    const prompt = `
      Simulate a CDN and Custom Domain diagnostic check for "${domain}".
      ${context}
      
      Return a JSON object with this schema:
      {
        "dns": {
          "a": ["IP strings"],
          "cname": "string (e.g. example.edgekey.net)",
          "provider": "Cloudflare | Akamai | CloudFront | Fastly | Unknown"
        },
        "headers": { "string": "string" (Simulate HTTP headers like X-Cache, Via, Server, Age, CF-Cache-Status) },
        "performance": [
           { "region": "North America", "ttfb": number, "status": "HIT | MISS | REVALIDATED" },
           { "region": "Europe", "ttfb": number, "status": "string" },
           { "region": "Asia", "ttfb": number, "status": "string" }
        ],
        "analysis": {
          "summary": "Technical summary of CDN health.",
          "potentialIssues": ["List issues like CNAME mismatch, SSL handshake fail at edge, or No caching"],
          "recommendations": ["Action items"],
          "severity": "Low | Medium | High | Critical"
        }
      }
      
      IMPORTANT: If a custom CNAME record exists for the domain in the provided context, prioritize using it in the 'dns.cname' field.
    `;

    const response = await robustGenerate({
      model: DEFAULT_FLASH,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) return JSON.parse(response.text);
    return null;
  } catch (error) {
    console.error("CDN Check Error:", error);
    return null;
  }
};

export const generatePacketBatch = async (filter: string, count: number = 5, startNo: number = 1): Promise<Packet[]> => {
  try {
    const prompt = `
      Generate a realistic batch of ${count} network packets for a Wireshark simulator.
      Context Filter: "${filter || 'any'}"
      Starting Packet Number: ${startNo}

      Return a JSON array of Packet objects with this schema:
      {
        "no": number,
        "time": number (seconds since capture start, e.g., 0.123),
        "source": string (IP),
        "destination": string (IP),
        "protocol": string (TCP, TLSv1.2, HTTP, DNS, ICMP, UDP),
        "length": number,
        "info": string (Summary info like "[SYN] Seq=0 Win=64240"),
        "details": {
          "ethernet": "Summary of Layer 2 (e.g. SRC MAC, DST MAC)",
          "ip": "Summary of Layer 3 (e.g. TTL, Flags, Identification)",
          "transport": "Summary of Layer 4 (e.g. Ports, Seq/Ack Nos, Window)",
          "application": "Optional Application Layer details (e.g. GET /index.html)"
        },
        "bytes": "A hex string of simulated packet bytes (at least 64 bytes)"
      }

      Simulate a realistic sequence (e.g., if TCP, show the 3-way handshake or a TLS exchange).
      If the filter is specific (e.g., "port 443"), only show traffic relevant to that filter.
    `;

    const response = await robustGenerate({
      model: DEFAULT_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Packet[];
    }
    return [];
  } catch (error) {
    console.error("Packet Gen Error:", error);
    return [];
  }
};

export interface MTRHop {
  hop: number;
  host: string;
  ip: string;
  loss: number;
  sent: number;
  recv: number;
  best: number;
  avrg: number;
  worst: number;
  last: number;
}

export const simulateMTR = async (target: string, isReverse: boolean = false): Promise<MTRHop[]> => {
  try {
    const prompt = `
      Simulate a ${isReverse ? 'REVERSE' : 'FORWARD'} MTR (My Traceroute) result to target: "${target}".
      ${isReverse ? 'Trace from the target server BACK to the user source (64.233.160.0/24).' : 'Trace from the user source to the target server.'}
      
      Return a JSON array of objects with the following schema:
      {
        "hop": number,
        "host": string (e.g. "isp-node-01.net"),
        "ip": string (e.g. "12.34.56.78"),
        "loss": number (0-100),
        "sent": number (usually 10),
        "recv": number,
        "best": number (ms),
        "avrg": number (ms),
        "worst": number (ms),
        "last": number (ms)
      }

      Simulate a realistic path with 8-15 hops. 
      Inject some minor packet loss or latency spikes in the middle hops to make it useful for troubleshooting practice.
    `;

    const response = await robustGenerate({
      model: DEFAULT_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MTRHop[];
    }
    return [];
  } catch (error) {
    console.error("MTR Simulation Error:", error);
    return [];
  }
};

export const analyzeMTR = async (hops: MTRHop[], target: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Act as a Senior Network Reliability Engineer. Analyze the following MTR (My Traceroute) data for target: "${target}".
      
      MTR Data:
      ${JSON.stringify(hops)}

      Focus on:
      1. Identifying the specific hop where latency or loss begins.
      2. Distinguishing between ICMP rate limiting (CoPP) and actual network congestion.
      3. Explaining the geographic path (e.g., crossing oceans or entering specific cloud providers like AWS/GCP).
      4. Providing a clear "Verdict" on path health.

      Provide the analysis in the following JSON format:
      {
        "summary": "High-level overview of the path health",
        "potentialIssues": ["List of specific concerns found in the hops"],
        "recommendations": ["Actionable steps for the user"],
        "severity": "Low" | "Medium" | "High" | "Critical"
      }
    `;

    const response = await robustGenerate({
      model: DEFAULT_PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty analysis response");
  } catch (error) {
    console.error("MTR Analysis Error:", error);
    return {
      summary: "Failed to generate AI analysis. Please check the raw logs below.",
      potentialIssues: ["AI Service Interruption"],
      recommendations: ["Review hops manually for persistent loss"],
      severity: "Low"
    };
  }
};

export const generateTopicExplanation = async (topic: string, level: string): Promise<string> => {
  try {
    const prompt = `
      Act as a Senior Network Engineer Mentor.
      Explain the topic: "${topic}" for a student at the "${level}" level.
      
      If the topic involves "Ping", "Traceroute", or "Salesforce Troubleshooting", refer to best practices for analyzing hop-by-hop latency and packet loss (Request Timed Out).
      
      Structure:
      1. Concept Overview (Analogy if possible)
      2. Key Technical Details (Protocols, Ports, RFCs where relevant)
      3. Industry Use Case (Where is this actually used?)
      4. Basic Configuration/Usage Snippet (Cisco IOS, Windows CMD, or Linux CLI)
      
      Keep it concise but technical. Format in Markdown.
    `;

    const response = await robustGenerate({
      model: DEFAULT_FLASH,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert networking instructor covering Cisco, Salesforce, and ISP architectures.",
      }
    });

    return response.text || "Failed to generate explanation.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service. Please check your network or try again.";
  }
};

export const generateWorkshopScenario = async (topic: string, difficulty: string): Promise<Scenario> => {
  try {
    const prompt = `Generate a networking workshop scenario about "${topic}" for a "${difficulty}" level engineer.`;
    
    const response = await robustGenerate({
      model: DEFAULT_PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            topology: { type: Type.STRING, description: "Text description of the network topology" },
            issue: { type: Type.STRING, description: "The problem to solve" },
            solution_steps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Step by step troubleshooting or configuration guide"
            },
            logs: { type: Type.STRING, description: "Simulated log output relevant to the issue" }
          },
          required: ["title", "description", "topology", "solution_steps"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as Scenario;
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Scenario Gen Error:", error);
    return {
        id: "error",
        title: "Error Generating Scenario",
        description: "Please try again.",
        topology: "N/A",
        issue: "API Error",
        solution_steps: ["Check console for details"]
    };
  }
};

export const analyzeNetworkLogs = async (logs: string): Promise<AnalysisResult> => {
    try {
        const prompt = `
        Act as a Senior Wireshark/Network Analyst. Analyze the following network logs or packet capture export data.
        
        Tasks:
        1. Provide a technical summary of findings.
        2. Identify specific issues (Packet Loss, Latency, Protocol anomalies).
        3. Recommend fixes.
        4. CRITICAL: Parse the logs into a list of "packets" (at least 15 entries if possible) so I can display them in a 3-pane Wireshark view. 
           For each packet, generate realistic "details" (Ethernet, IP, Transport layers) and a "bytes" hex string.
        
        The input might be raw text-based logs OR a hex-encoded stream from a binary PCAP file. 
        If it looks like a hex stream (e.g. starting with d4c3b2a1 or a1b2c3d4), parse it as a libpcap binary file.

        Input Data:
        ${logs.substring(0, 40000)}
        `;

        const response = await robustGenerate({
            model: DEFAULT_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Detailed technical summary of traffic flow and transfer health." },
                        potentialIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                        packets: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              no: { type: Type.INTEGER },
                              time: { type: Type.NUMBER },
                              source: { type: Type.STRING },
                              destination: { type: Type.STRING },
                              protocol: { type: Type.STRING },
                              length: { type: Type.INTEGER },
                              info: { type: Type.STRING },
                              details: {
                                type: Type.OBJECT,
                                properties: {
                                  ethernet: { type: Type.STRING },
                                  ip: { type: Type.STRING },
                                  transport: { type: Type.STRING },
                                  application: { type: Type.STRING }
                                }
                              },
                              bytes: { type: Type.STRING }
                            }
                          }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as AnalysisResult;
        }
        throw new Error("Empty response");
    } catch (error) {
        console.error("Log Analysis Error", error);
        return {
            summary: "Analysis Failed. Please ensure the log data is valid text or a standard PCAP file.",
            potentialIssues: ["API Connectivity or Data Format Issue"],
            recommendations: ["Check connection", "Ensure uploaded file is valid PCAP or text"],
            severity: "Low"
        }
    }
};

export const analyzeIdentityArtifact = async (artifact: string, type: 'SAML' | 'OAUTH' | 'CERT'): Promise<AnalysisResult> => {
    try {
        const prompt = `
        Act as an Identity & Access Management (IAM) Expert. Analyze the following ${type} artifact.
        
        Artifact:
        ${artifact.substring(0, 20000)}

        Specific Instructions:
        - If SAML: Decode if Base64. Check for 'AudienceRestriction', 'NotBefore'/'NotOnOrAfter' (Clock Skew), 'Signature', and 'Issuer' mismatches.
        - If OAUTH: Analyze the error code (e.g., 'invalid_grant', 'invalid_client'). Explain why the flow failed.
        - If CERT: Decode the PEM. Identify the Common Name (CN), validity dates, and serial number.
        
        Provide a strict technical diagnosis.
        `;

        const response = await robustGenerate({
            model: DEFAULT_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        potentialIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as AnalysisResult;
        }
        throw new Error("Empty response");
    } catch (error) {
        console.error("Identity Analysis Error", error);
        return {
            summary: "Failed to analyze Identity artifact.",
            potentialIssues: ["Format Error or Encoding Issue"],
            recommendations: ["Ensure SAML is Base64 or XML", "Ensure Cert is standard PEM format"],
            severity: "Low"
        }
    }
};

export const analyzeHAR = async (entries: HAREntrySummary[]): Promise<AnalysisResult> => {
    try {
        const slowOrErrors = entries.filter(e => e.time > 1000 || e.status >= 400);
        const top10 = slowOrErrors.slice(0, 15);
        const stats = {
            totalRequests: entries.length,
            errors: entries.filter(e => e.status >= 400).length,
            slowRequests: entries.filter(e => e.time > 1000).length
        };

        const prompt = `
        Act as a Web Performance Engineer. Analyze these HAR (HTTP Archive) entries.
        
        Statistics: ${JSON.stringify(stats)}
        
        Problematic Requests (Slow or Errors):
        ${JSON.stringify(top10)}

        Provide:
        1. Summary of performance bottlenecks.
        2. Specific issues.
        3. Recommendations to optimize.
        `;

        const response = await robustGenerate({
            model: DEFAULT_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        potentialIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] }
                    }
                }
            }
        });

        if (response.text) {
             return JSON.parse(response.text) as AnalysisResult;
        }
        throw new Error("Empty response");
    } catch (error) {
        console.error("HAR Analysis Error", error);
        return {
             summary: "Failed to analyze HAR file.",
             potentialIssues: ["Check file format"],
             recommendations: ["Ensure it is a standard .har JSON"],
             severity: "Low"
        };
    }
}

export const runTerminalCommand = async (command: string, customRecords?: DNSRecord[]): Promise<string> => {
    try {
        const context = customRecords ? `Custom DNS context: ${JSON.stringify(customRecords)}` : "";
        const prompt = `
        Act as a Windows Command Prompt Simulator.
        ${context}
        The user runs the command: "${command}"
        
        Generate the raw text output for this command.
        
        Rules:
        - If it is a ping, simulate a realistic ping sequence (4 packets).
        - If it is tracert/traceroute, simulate 8-15 hops.
        - If it is nslookup or dig, look at the custom DNS context first.
        - Randomly inject 1% packet loss or a high latency hop occasionally to make it realistic.
        - Do not add markdown code blocks. Just the raw text.
        `;

        const response = await robustGenerate({
            model: DEFAULT_FLASH,
            contents: prompt
        });

        return response.text || "";
    } catch (error) {
        return "Error executing command. Please try again.";
    }
};

export interface PingPlotterHop {
    hop: number;
    pl: number;
    ip: string;
    name: string;
    avg: number;
    cur: number;
    history: number[];
}

export const simulatePingPlotter = async (target: string): Promise<PingPlotterHop[]> => {
    try {
        const prompt = `
        Simulate a PingPlotter trace to "${target}".
        Return a JSON array of hops.
        Each hop should have: hop number, packet loss % (0-100), ip address, hostname, average latency, current latency, and a history array of 20 latency values (0 for loss).
        `;

        const response = await robustGenerate({
            model: DEFAULT_FLASH,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
              }
        });

        if (response.text) {
             return JSON.parse(response.text) as PingPlotterHop[];
        }
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export interface ThousandEyesNode {
    id: string;
    type: 'agent' | 'router' | 'target';
    name: string;
    ip: string;
    loss: number;
    avgMs: number;
}
export interface ThousandEyesLink {
    source: string;
    target: string;
}

export const simulateThousandEyes = async (target: string): Promise<{nodes: ThousandEyesNode[], links: ThousandEyesLink[]}> => {
    try {
        const prompt = `
        Simulate a ThousandEyes Path Visualization to "${target}".
        Return a JSON object with "nodes" and "links".
        Nodes have: id, type (agent, router, target), name, ip, loss (%), avgMs.
        Links have: source (node id), target (node id).
        `;

        const response = await robustGenerate({
            model: DEFAULT_FLASH,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

         if (response.text) {
             return JSON.parse(response.text);
        }
        return { nodes: [], links: [] };
    } catch (e) {
        console.error(e);
        return { nodes: [], links: [] };
    }
}

export const simulateMxLookup = async (domain: string, type: 'MX' | 'SPF' | 'DMARC' | 'DIAGNOSTIC' | 'DNS' | 'HEADERS', headersInput?: string): Promise<any> => {
    try {
        const prompt = `
        Simulate an MxToolbox lookup for domain "${domain}" with tool type "${type}".
        
        CRITICAL REAL-WORLD DATA FOR techlearnersera.com:
        If domain is "techlearnersera.com", the MX hostnames MUST be EXACTLY:
        1. Pref 0, Hostname: smtp.secureserver.net, IP: 216.69.141.113, ISP: GoDaddy.com, LLC (AS398101)
        2. Pref 10, Hostname: mailstore1.secureserver.net, IP: 216.69.141.114, ISP: GoDaddy.com, LLC (AS398101)
        
        If type is 'SPF' and domain is 'techlearnersera.com', return the TXT record: "v=spf1 include:spf.secureserver.net -all"

        IF type is 'MX':
        Return JSON: { 
          type: 'MX', 
          records: [
            { pref: number, hostname: string, ip: string, ttl: string, isp: string }
          ],
          tests: [
            { name: "DNS Record Published", status: "Pass", details: "DNS Record found" },
            { name: "DMARC Record Published", status: "Pass", details: "DMARC Record found" },
            { name: "DMARC Policy Not Enabled", status: "Pass", details: "DMARC Quarantine/Reject policy enabled" }
          ]
        }

        IF type is 'SPF':
        Return JSON: {
          type: 'SPF',
          record: "string (e.g. v=spf1 include:_spf.google.com ~all)",
          status: "Valid",
          tests: [
            { name: "SPF Record Published", status: "Pass", details: "SPF record found" },
            { name: "SPF Syntax Check", status: "Pass", details: "The SPF record has valid syntax" }
          ]
        }

        IF type is 'DMARC':
        Return JSON: { 
          type: 'DMARC', 
          record: "v=DMARC1; p=quarantine; rua=mailto:dmarc@domain.com", 
          policy: "Quarantine",
          status: "Valid",
          issues: []
        }

        IF type is 'DIAGNOSTIC':
        Return JSON: {
          type: 'DIAGNOSTIC',
          tests: [
            { name: "SMTP Banner Check", status: "Pass", details: "220 mx.google.com ESMTP" },
            { name: "SPF Record", status: "Pass", details: "Found: v=spf1 include:_spf.google.com ~all" }
          ]
        }

        IF type is 'DNS':
        Return JSON: {
          type: 'DNS',
          records: [
            { type: "A", name: "@", value: "1.2.3.4", ttl: "3600" }
          ]
        }

        IF type is 'HEADERS':
        Return JSON: {
          type: 'HEADERS',
          hops: [
            { from: "Origin", by: "First Hop", date: "Date string", delay: "0ms" }
          ],
          auth: { spf: "Pass", dkim: "Pass", dmarc: "Pass" },
          summary: "Forensic analysis."
        }
        
        Make the data realistic for the domain provided.
        `;

        const response = await robustGenerate({
            model: DEFAULT_FLASH,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        if (response.text) return JSON.parse(response.text);
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const simulateSSLCheck = async (domain: string): Promise<SSLCheckResult | null> => {
    try {
        const prompt = `
        Simulate an SSL Shopper check for "${domain}".
        Return JSON matching SSLCheckResult schema.
        `;

        const response = await robustGenerate({
            model: DEFAULT_FLASH,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        if (response.text) return JSON.parse(response.text);
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const analyzeSplunkLogs = async (logs: string): Promise<AnalysisResult> => {
    try {
        const prompt = `Act as a Splunk Administrator. Analyze the following splunkd logs: ${logs}`;
        const response = await robustGenerate({
            model: DEFAULT_PRO,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        if (response.text) return JSON.parse(response.text) as AnalysisResult;
        throw new Error("Empty response");
    } catch (error) {
        return { summary: "Failed to analyze logs.", potentialIssues: [], recommendations: [], severity: "Low" };
    }
}
