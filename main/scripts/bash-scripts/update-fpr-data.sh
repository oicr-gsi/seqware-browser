#!/bin/bash

source "/oicr/cluster/etc/profile"

cd /u/mcheng/browsertest

qsub -cwd -b y -N PerlFPR -e error.log -o output.log -l h_vmem=8g "export PERL5LIB=/oicr/local/analysis/lib/perl/pipe/lib/perl5; export PATH=${PATH}:/oicr/local/analysis/lib/perl/pipe/bin; perl fpr-json.pl /.mounts/labs/seqprodbio/private/backups/sqwprod-db.hpc.oicr.on.ca/seqware_files_report_latest.gz"

qsub -cwd -b y -N WorkflowFiles -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "/u/mcheng/browsertest/node-v5.7.0-linux-x64/bin/node --max_old_space_size=8192 fpr-file.js fpr-File.json"
qsub -cwd -b y -N ReportData -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "/u/mcheng/browsertest/node-v5.7.0-linux-x64/bin/node --max_old_space_size=8192 fpr-report-data.js workflowRuns.yml fpr-Library.json"
qsub -cwd -b y -N RNAReportData -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "/u/mcheng/browsertest/node-v5.7.0-linux-x64/bin/node --max_old_space_size=8192 fpr-rna-data.js workflowRuns.yml fpr-Library.json"
qsub -cwd -b y -N GraphData -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "/u/mcheng/browsertest/node-v5.7.0-linux-x64/bin/node --max_old_space_size=8192 fpr-graph-data.js fpr-Library.json"

