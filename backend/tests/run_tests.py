#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner
import argparse


def run_tests(test_labels=None, verbosity=1, coverage=False):
    """
    Run tests for the specified apps or all tests if no apps are specified.
    
    Args:
        test_labels: List of app names to test (e.g., ['college.schedules', 'academics.enrollment'])
        verbosity: Verbosity level (0-3)
        coverage: Whether to run tests with coverage report
    """
    # Use Django's test runner
    if not test_labels:
        test_labels = [
            'college.schedules', 
            'college.courses',
            'college.classrooms',
            'college.departments', 
            'college.faculties',
            'academics.enrollment',
            'academics.bindings',
            'users.students',
            'users.lecturers'
        ]
    
    os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
    django.setup()
    
    # If coverage enabled, use the coverage test runner
    if coverage:
        try:
            import coverage
            from django.test.runner import DiscoverRunner

            class CoverageTestRunner(DiscoverRunner):
                def run_tests(self, test_labels, extra_tests=None, **kwargs):
                    cov = coverage.Coverage(source=['college', 'academics', 'users'], omit=['*/tests/*', '*/migrations/*'])
                    cov.start()
                    result = super().run_tests(test_labels, extra_tests, **kwargs)
                    cov.stop()
                    cov.save()
                    cov.report()
                    return result

            test_runner = CoverageTestRunner(verbosity=verbosity)
        except ImportError:
            print("Coverage package not installed. Running tests without coverage.")
            TestRunner = get_runner(settings)
            test_runner = TestRunner(verbosity=verbosity)
    else:
        TestRunner = get_runner(settings)
        test_runner = TestRunner(verbosity=verbosity)
    
    print(f"Running tests for: {', '.join(test_labels)}")
    failures = test_runner.run_tests(test_labels)
    
    return failures


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run Django tests')
    parser.add_argument('--apps', nargs='+', help='Apps to test (e.g., college.schedules academics.enrollment)')
    parser.add_argument('--verbosity', type=int, default=1, choices=[0, 1, 2, 3], help='Verbosity level (0-3)')
    parser.add_argument('--coverage', action='store_true', help='Run tests with coverage report')
    
    args = parser.parse_args()
    
    test_labels = args.apps if args.apps else None
    failures = run_tests(test_labels, args.verbosity, args.coverage)
    
    sys.exit(bool(failures)) 