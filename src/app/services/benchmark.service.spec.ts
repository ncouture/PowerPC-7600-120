import { TestBed } from '@angular/core/testing';
import { BenchmarkService, BenchmarkResult } from './benchmark.service';

describe('BenchmarkService', () => {
  let service: BenchmarkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenchmarkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Benchmark Engine Execution', () => {
    it('should calculate valid MFLOPS and memory bandwidth metrics', () => {
      const result: BenchmarkResult = service.runBenchmarkSuite(5000);
      expect(result.mflops).toBeGreaterThan(0);
      expect(result.memoryBandwidthMBps).toBeGreaterThan(0);
      expect(result.swarOpsPerSec).toBeGreaterThan(0);
      expect(result.naiveOpsPerSec).toBeGreaterThan(0);
      expect(result.speedupRatio).toBeGreaterThan(1.0); // SWAR should be faster than naive loop
      expect(result.cpuModel).toContain('PowerPC 604e');
    });

    it('should normalize clock cycles to simulated 200 MHz PowerPC 604e timing', () => {
      const result: BenchmarkResult = service.runBenchmarkSuite(1000);
      expect(result.clockCyclesNormalized).toBeGreaterThan(0);
      expect(typeof result.formattedExecutionTime).toBe('string');
    });
  });
});
