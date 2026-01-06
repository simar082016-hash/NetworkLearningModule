
import React, { useState } from 'react';
import { analyzeIdentityArtifact } from '../services/geminiService';
import { AnalysisResult, CertDetails } from '../types';
import { Shield, Lock, FileCode, CheckCircle, AlertTriangle, Key, Info, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

type IdentityTab = 'SAML' | 'OAUTH' | 'CERT';

const IdentityDebuggerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<IdentityTab>('SAML');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const analysis = await analyzeIdentityArtifact(input, activeTab);
    setResult(analysis);
    setLoading(false);
  };

  const loadSample = () => {
    if (activeTab === 'SAML') {
        setInput(`<saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"><saml2:Conditions NotBefore="2023-01-01T00:00:00Z" NotOnOrAfter="2023-01-01T00:05:00Z"></saml2:Conditions></saml2p:Response>`);
    } else if (activeTab === 'OAUTH') {
        setInput(`{ "error": "invalid_grant", "error_description": "authentication failure" }`);
    } else {
        setInput(`-----BEGIN CERTIFICATE-----\nMIIC8DCCAdigAwIBAgIQMws0iozmNodCdl0wCgLcgjANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQDEylNaW55b3N2ZnZnQxp1cmRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yMzA5MjEwMzMzMTRaFw0yNjA5MjEwMzMzMTRaMDQxMjAwBgNVBAMTylNaW55b3N2ZnZnQxp1cmRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOCAQ8AMIIBCgKCAQEAwZMs59tWjjHXIR7icN3iKrSVBadbNpASM1mvZJ/e8Vw3xRWO243LDdzRODmsrVl1+Gcov2icXS+8c94MBa8dColqVw03cMikjZU8q82FfFZD8E4j5heh4+QBC1gqoPpqbVvM4v+fqVGYRQ1jFMwvbj5HfUgmZSvI8jixzD/9BSO5RJRkpALdHoYbzW7pQbx7X8fnYxy9nX/Mfc8lZ/XbfVXPHGK4eAGP8OXs45He2y6bcuMFGluarqMo0OsxhahbuHX4a9apabdg3RVr/PXQYk83sVofhDPfGK/zWWV7m89T5gZTu4KqjD0UMxBzSWvJGeFsDUtNL95nrEsH5AQIDAQABo0GCSqGSIb3DQEBCwUAA4IBAQBd7/Ae8u5QGRXwj8vG9JDMXrbTRMdIEWHgQchvrghAK0xqBRRmaetldPHlzo5kygyewQLInHB6bvjLCPAKWoRRKhHafwnKiMPm7Z2GUwkQsVyFQSEs3ntZHPw93UoQynKwq2iPTcx+t9P3oHS0yomlcuOzpsckPvB7TKpwvd2WpFKzhh/JB0DjokE1rCOCj22uSmkgoAGVX0aAOphetpSpc9k1Gzb8lRiMsKDcV0G+gniZXBDEhbM8RdN5pKCQCc9z4HXYxACSkZTTy/EuWbd644TU/9aXWJINSbpj6L9llp7e/3/gXn0fot+2qZ3ioYjnbN6eClZ50fcLITj50b\n-----END CERTIFICATE-----`);
    }
    setResult(null);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="text-purple-400" />
            Identity & Auth Debugger
          </h2>
          <p className="text-slate-400 mt-1">Decode and analyze SAML Assertions, OAuth Errors, and Certificates.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700 pb-1">
          <button 
             onClick={() => { setActiveTab('SAML'); setResult(null); setInput(''); }}
             className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 
             ${activeTab === 'SAML' ? 'text-orange-400 border-orange-400' : 'text-slate-500 border-transparent hover:text-white'}`}
          >
              <Shield className="w-4 h-4" /> SAML 2.0
          </button>
          <button 
             onClick={() => { setActiveTab('OAUTH'); setResult(null); setInput(''); }}
             className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 
             ${activeTab === 'OAUTH' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-white'}`}
          >
              <Lock className="w-4 h-4" /> OAuth 2.0
          </button>
          <button 
             onClick={() => { setActiveTab('CERT'); setResult(null); setInput(''); }}
             className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 
             ${activeTab === 'CERT' ? 'text-green-400 border-green-400' : 'text-slate-500 border-transparent hover:text-white'}`}
          >
              <FileCode className="w-4 h-4" /> Cert & Chain Analysis
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-4">
            <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
                <div className="bg-slate-800 p-3 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 uppercase">
                        {activeTab === 'CERT' ? 'Paste Certificate Text' : 'Input Payload'}
                    </span>
                    <button onClick={loadSample} className="text-xs text-blue-400 hover:underline">Load Sample</button>
                </div>
                <textarea
                    className="flex-1 w-full bg-slate-900/50 p-4 font-mono text-xs text-slate-300 focus:outline-none resize-none"
                    placeholder={
                        activeTab === 'SAML' ? 'Paste Base64 SAMLResponse or XML...' :
                        activeTab === 'OAUTH' ? 'Paste JSON Error Response...' :
                        '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                />
            </div>

            {activeTab === 'CERT' && (
                <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-blue-300 uppercase mb-1">PEM Format Guide</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            A valid PEM certificate must start with <code>-----BEGIN CERTIFICATE-----</code> and end with <code>-----END CERTIFICATE-----</code>. Each line should be base64 encoded text. You can paste multiple certificates to analyze a full trust chain.
                        </p>
                    </div>
                </div>
            )}
            
            <button
                onClick={handleAnalyze}
                disabled={loading || !input}
                className={`py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                  ${loading || !input 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                  }`}
              >
                {loading ? <LoadingSpinner /> : (
                  <>
                    <Key className="w-4 h-4" />
                    {activeTab === 'CERT' ? 'Analyze Certificate' : 'Decode & Analyze'}
                  </>
                )}
            </button>
        </div>

        <div className="flex flex-col overflow-hidden">
            {loading ? (
                <div className="flex-1 glass-panel rounded-lg flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : result ? (
                <div className="flex-1 glass-panel rounded-lg overflow-y-auto custom-scroll p-6 space-y-6">
                    {/* Specialized Cert UI */}
                    {activeTab === 'CERT' && result.certDetails && (
                        <div className="animate-fadeIn">
                             <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg font-bold text-sm">
                                Certificate Information:
                             </div>
                             <div className="bg-slate-800/80 border-x border-b border-slate-700 p-4 space-y-2.5 rounded-b-lg">
                                 {[
                                     { label: 'Common Name', value: result.certDetails.commonName },
                                     { label: 'Subject Alternative Names', value: result.certDetails.sans?.join(', ') || 'None' },
                                     { label: 'Organization', value: result.certDetails.organization },
                                     { label: 'Organization Unit', value: result.certDetails.organizationUnit },
                                     { label: 'Locality', value: result.certDetails.locality },
                                     { label: 'State', value: result.certDetails.state },
                                     { label: 'Country', value: result.certDetails.country },
                                     { label: 'Valid From', value: result.certDetails.validFrom },
                                     { label: 'Valid To', value: result.certDetails.validTo },
                                     { label: 'Serial Number', value: result.certDetails.serialNumber },
                                 ].map((field, i) => (
                                     <div key={i} className="flex items-center gap-2 group">
                                         <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                         <div className="flex flex-wrap items-center">
                                            <span className="bg-blue-600/90 text-white px-2 py-0.5 text-xs font-bold mr-1">{field.label}:</span>
                                            <span className="text-xs text-blue-100 bg-blue-500/20 px-2 py-0.5 rounded font-medium border border-blue-500/20">{field.value || 'N/A'}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                        <h3 className="text-lg font-semibold text-white">Diagnostic Results</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                            ${result.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                              result.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                              result.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                            {result.severity} Issue
                        </span>
                    </div>

                    <div>
                         <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Analysis Summary</h4>
                         <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            Detected Problems
                        </h4>
                        <ul className="space-y-2">
                            {result.potentialIssues.map((issue, idx) => (
                                <li key={idx} className="bg-orange-900/20 p-3 rounded border border-orange-500/20 text-orange-200 text-sm font-mono">
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            How to Fix
                        </h4>
                        <ul className="space-y-2">
                            {result.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                                    <span className="bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white shrink-0 mt-0.5">{idx + 1}</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="flex-1 glass-panel rounded-lg flex flex-col items-center justify-center text-slate-500 p-8 border-2 border-dashed border-slate-700">
                    <Shield className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Ready to Decode</p>
                    <p className="text-sm text-center max-w-xs mt-2">
                        {activeTab === 'CERT' 
                            ? 'Paste your PEM formatted certificate text. The AI will extract Common Name, Validity, and Serial Number into a structured report.'
                            : 'Paste your raw SAML assertion or JSON Error to identify configuration mismatches.'}
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default IdentityDebuggerView;
