# Perl script to extract contents from file provenance report and spilt into useful JSON
# that are taken in by javascript functions

use strict;
use warnings;
use JSON;
use IO::Uncompress::Gunzip qw($GunzipError);

our @ISA = qw (Exporter);
our @EXPORT_OK;

my ($fpr, $outputDir) = @ARGV;
my %fprData;
my $json;

my $workflowRunSWID;
my $IUSSWID;
my $fileSWID;

########################################################################
# Extract data from File Provenance Report
my $line;
my @header;
my %linehash;
my $fprHandle = IO::Uncompress::Gunzip->new( $fpr )
    or die "IO::Uncompress::Gunzip failed: $GunzipError\n";

# Get file provenance report column headings
if ($fprHandle) { 
	$line = $fprHandle->getline();
	chomp $line;
	@header = split /\t/, $line; 
}

# Read data lines of file provenance report
while (!$fprHandle->eof()) {
	$line = $fprHandle->getline();
	chomp $line;
	@linehash{@header} = split("\t", $line);
	
	my $filePath = $linehash{"File Path"};
	my $workflowName = $linehash{"Workflow Run Name"};
	
	$fileSWID = $linehash{"File SWID"};
	$IUSSWID = $linehash{"IUS SWID"};
	$workflowRunSWID = $linehash{"Workflow Run SWID"};

	# By File
	$fprData{"File"}{$fileSWID}{"Path"} = $filePath;
	$fprData{"File"}{$fileSWID}{"WorkflowSWID"} = $workflowRunSWID;

	# By Library
	if ($filePath =~ /.*.BamQC.json$/ ) {
        $fprData{"Library"}{$IUSSWID}{"JSON"} = $filePath;
    } elsif ($filePath =~ /.*.log$/ and $workflowName eq ("Xenome")){
   		$fprData{"Library"}{$IUSSWID}{"XenomeFile"} = $filePath;
   	} elsif ($filePath =~ /.*rnaqc.report.zip$/){
   		$fprData{"Library"}{$IUSSWID}{"RNAZipFile"} = $filePath;
   	}
}

my @categories = ('File', 'Library');
my %hash;
foreach my $key (@categories){
	open (FH, ">", "$outputDir/fpr-".$key.".json");
	$hash{$key} = \%{$fprData{$key}};
	$json = encode_json(\%hash);
	print FH $json;
	delete $hash{$key};
	close (FH);
}